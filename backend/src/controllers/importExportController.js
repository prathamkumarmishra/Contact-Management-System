const Contact = require('../models/Contact');
const ActivityLog = require('../models/ActivityLog');
const responseHandler = require('../utils/responseHandler');
const cppBridge = require('../services/cppBridge');
const fs = require('fs');

/**
 * Custom CSV parser supporting quotes and escaped commas
 */
const parseCSV = (text) => {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  // Headers line
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const contacts = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by comma, respecting quotes
    const row = [];
    let insideQuote = false;
    let entry = '';
    
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim().replace(/^["']|["']$/g, ''));
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim().replace(/^["']|["']$/g, ''));

    if (row.length < headers.length) continue;

    const contactObj = {};
    headers.forEach((h, index) => {
      contactObj[h] = row[index] || '';
    });
    contacts.push(contactObj);
  }
  
  return contacts;
};

/**
 * Import Contacts from CSV file
 */
exports.importCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return responseHandler.error(res, 'Please upload a CSV file', 'BAD_REQUEST', null, 400);
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    fs.unlinkSync(req.file.path); // clean temporary upload

    const rawContacts = parseCSV(fileContent);
    if (rawContacts.length === 0) {
      return responseHandler.error(res, 'CSV file is empty or invalid', 'BAD_REQUEST', null, 400);
    }

    const imported = [];
    const skipped = [];

    // Loop through CSV entries, validating duplicates in C++
    for (const raw of rawContacts) {
      const {
        firstName,
        lastName,
        phone,
        email,
        category = 'personal',
        company = '',
        designation = '',
        city = '',
        country = ''
      } = raw;

      if (!firstName || !phone) {
        skipped.push({ name: firstName || 'Unnamed', reason: 'Missing firstName or phone' });
        continue;
      }

      // Check duplicates in C++ HashMap
      const dupCheck = await cppBridge.sendCommand('checkDuplicate', { phone, email: email || '' });
      if (dupCheck.duplicate) {
        skipped.push({ name: `${firstName} ${lastName || ''}`, reason: 'Duplicate phone or email in C++ store' });
        continue;
      }

      // Save to database
      const contact = await Contact.create({
        userId: req.user.id,
        firstName,
        lastName: lastName || '',
        phone,
        email: email || '',
        category: ['work', 'personal', 'family', 'friend', 'other'].includes(category.toLowerCase()) ? category.toLowerCase() : 'personal',
        company,
        designation,
        city,
        country
      });

      // Load to C++
      const formatted = {
        id: contact._id.toString(),
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        alternativePhone: '',
        email: contact.email || '',
        company: contact.company || '',
        designation: contact.designation || '',
        department: '',
        category: contact.category || 'personal',
        city: contact.city || '',
        state: '',
        country: contact.country || '',
        zipCode: '',
        website: '',
        linkedin: '',
        birthday: '',
        notes: '',
        tags: [],
        isFavorite: false,
        isBlocked: false,
        lastContacted: '',
        contactCount: 0,
        createdAt: contact.createdAt.toISOString()
      };
      await cppBridge.sendCommand('insert', formatted);
      imported.push(contact);
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'import',
      metadata: { count: imported.length }
    });

    return responseHandler.success(res, `CSV Import completed successfully`, {
      importedCount: imported.length,
      skippedCount: skipped.length,
      skippedDetails: skipped
    }, 200);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * Export Contacts to CSV file
 */
exports.exportCSV = async (req, res, next) => {
  try {
    // Retrieve contacts in alphabetical order from C++ BST inorder traverser
    const cppResult = await cppBridge.sendCommand('getSorted', {
      field: 'firstName',
      order: 'asc'
    });

    const contacts = cppResult.contacts || [];

    // Construct CSV string
    const headers = [
      'firstName', 'lastName', 'phone', 'email', 'category', 
      'company', 'designation', 'city', 'country'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    contacts.forEach(c => {
      const row = [
        `"${c.firstName.replace(/"/g, '""')}"`,
        `"${(c.lastName || '').replace(/"/g, '""')}"`,
        `"${c.phone}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${c.category}"`,
        `"${(c.company || '').replace(/"/g, '""')}"`,
        `"${(c.designation || '').replace(/"/g, '""')}"`,
        `"${(c.city || '').replace(/"/g, '""')}"`,
        `"${(c.country || '').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    // Set headings for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts-export.csv');
    
    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'export',
      metadata: { count: contacts.length }
    });

    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
