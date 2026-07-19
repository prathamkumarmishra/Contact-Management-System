const Contact = require('../models/Contact');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const responseHandler = require('../utils/responseHandler');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const cppBridge = require('../services/cppBridge');
const fs = require('fs');

/**
 * Helper to upload image to Cloudinary or keep local path
 */
const uploadImage = async (file) => {
  if (!file) return '';

  if (isConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'smart_contacts',
        transformation: [{ width: 250, height: 250, crop: 'thumb', gravity: 'face' }]
      });
      fs.unlinkSync(file.path);
      return result.secure_url;
    } catch (error) {
      console.error('❌ Cloudinary Upload Error:', error.message);
    }
  }

  return `/uploads/${file.filename}`;
};

/**
 * Helper to sync all active contacts to C++ store (fallback fallback recovery)
 */
const syncAllToCpp = async () => {
  try {
    const contacts = await Contact.find({ isDeleted: false });
    const formatted = contacts.map(c => ({
      id: c._id.toString(),
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      alternativePhone: c.alternativePhone || '',
      email: c.email || '',
      company: c.company || '',
      designation: c.designation || '',
      department: c.department || '',
      category: c.category || 'personal',
      city: c.city || '',
      state: c.state || '',
      country: c.country || '',
      zipCode: c.zipCode || '',
      website: c.website || '',
      linkedin: c.linkedin || '',
      birthday: c.birthday ? c.birthday.toISOString().split('T')[0] : '',
      notes: c.notes || '',
      tags: c.tags || [],
      isFavorite: c.isFavorite,
      isBlocked: c.isBlocked,
      lastContacted: c.lastContacted ? c.lastContacted.toISOString() : '',
      contactCount: c.contactCount || 0,
      createdAt: c.createdAt.toISOString()
    }));
    await cppBridge.sendCommand('load', formatted);
  } catch (err) {
    console.error('⚠️ Failed to sync active database list to C++:', err.message);
  }
};

/**
 * Create Contact
 */
exports.createContact = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      alternativePhone,
      email,
      company,
      designation,
      department,
      category,
      address,
      city,
      state,
      country,
      zipCode,
      website,
      linkedin,
      birthday,
      notes,
      tags,
      isFavorite
    } = req.body;

    // 1. Check duplicate phone or email in C++ Engine in O(1) time
    const dupCheck = await cppBridge.sendCommand('checkDuplicate', { phone, email: email || '' });
    if (dupCheck.duplicate) {
      const field = dupCheck.details.phone ? 'phone number' : 'email address';
      return responseHandler.error(res, `Contact already exists with this ${field} in C++ Engine`, 'CONFLICT', null, 409);
    }

    // 2. Process photo upload
    const profilePhoto = await uploadImage(req.file);

    // Convert tags if string
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    // 3. Persist in MongoDB
    const contact = await Contact.create({
      userId: req.user.id,
      profilePhoto,
      firstName,
      lastName,
      phone,
      alternativePhone,
      email,
      company,
      designation,
      department,
      category,
      address,
      city,
      state,
      country,
      zipCode,
      website,
      linkedin,
      birthday: birthday ? new Date(birthday) : null,
      notes,
      tags: parsedTags,
      isFavorite: isFavorite === 'true' || isFavorite === true
    });

    // 4. Insert into C++ Engine memory structures (Trie, BST, HashMap, Heap)
    const formatted = {
      id: contact._id.toString(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      alternativePhone: contact.alternativePhone || '',
      email: contact.email || '',
      company: contact.company || '',
      designation: contact.designation || '',
      department: contact.department || '',
      category: contact.category || 'personal',
      city: contact.city || '',
      state: contact.state || '',
      country: contact.country || '',
      zipCode: contact.zipCode || '',
      website: contact.website || '',
      linkedin: contact.linkedin || '',
      birthday: contact.birthday ? contact.birthday.toISOString().split('T')[0] : '',
      notes: contact.notes || '',
      tags: contact.tags || [],
      isFavorite: contact.isFavorite,
      isBlocked: contact.isBlocked,
      lastContacted: contact.lastContacted ? contact.lastContacted.toISOString() : '',
      contactCount: contact.contactCount || 0,
      createdAt: contact.createdAt.toISOString()
    };
    
    await cppBridge.sendCommand('insert', formatted);

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'create',
      targetId: contact._id,
      metadata: { name: `${firstName} ${lastName}` }
    });

    // Create Notification
    Notification.create({
      userId: req.user.id,
      type: 'contact_created',
      title: 'Contact Created',
      message: `${firstName} ${lastName} has been added to your contacts.`,
      referenceId: contact._id
    }).catch(err => console.error('Notification create error:', err.message));

    return responseHandler.success(res, 'Contact created successfully', { contact }, 201);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * Get Contacts (Paginated & Sorted via C++ BST and Sorting Algorithms)
 */
exports.getContacts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'firstName', // Sort by firstName (BST) by default
      category,
      isFavorite,
      isBlocked,
      q
    } = req.query;

    // 1. Fetch sorted list from C++ engine (Merge/Quick sort bindings)
    const cppSortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const cppSortOrder = sort.startsWith('-') ? 'desc' : 'asc';

    const cppResult = await cppBridge.sendCommand('getSorted', {
      field: cppSortField,
      order: cppSortOrder
    });

    let contactsList = cppResult.contacts || [];

    // 2. Perform filters in Node.js layer on the sorted C++ results list
    if (category) {
      contactsList = contactsList.filter(c => c.category === category);
    }
    if (isFavorite) {
      contactsList = contactsList.filter(c => c.isFavorite === (isFavorite === 'true'));
    }
    if (isBlocked) {
      contactsList = contactsList.filter(c => c.isBlocked === (isBlocked === 'true'));
    }
    if (q) {
      const searchKey = q.toLowerCase();
      contactsList = contactsList.filter(c =>
        c.firstName.toLowerCase().includes(searchKey) ||
        c.lastName.toLowerCase().includes(searchKey) ||
        c.email.toLowerCase().includes(searchKey) ||
        c.company.toLowerCase().includes(searchKey) ||
        c.phone.includes(searchKey)
      );
    }

    // 3. Paginate
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const total = contactsList.length;
    const totalPages = Math.ceil(total / options.limit);
    const skip = (options.page - 1) * options.limit;
    const paginatedContacts = contactsList.slice(skip, skip + options.limit);

    return responseHandler.success(res, 'Contacts retrieved successfully via C++ sorting engine', {
      contacts: paginatedContacts,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
        hasNextPage: options.page < totalPages,
        hasPrevPage: options.page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Contact by ID
 */
exports.getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false
    });

    if (!contact) {
      return responseHandler.error(res, 'Contact not found', 'NOT_FOUND', null, 404);
    }

    return responseHandler.success(res, 'Contact retrieved successfully', { contact });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Contact
 */
exports.updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false
    });

    if (!contact) {
      return responseHandler.error(res, 'Contact not found', 'NOT_FOUND', null, 404);
    }

    const updateFields = { ...req.body };

    if (updateFields.tags) {
      updateFields.tags = typeof updateFields.tags === 'string' 
        ? JSON.parse(updateFields.tags) 
        : updateFields.tags;
    }

    // O(1) duplicate checks if fields are changing
    if (updateFields.phone && updateFields.phone !== contact.phone) {
      const dupCheck = await cppBridge.sendCommand('checkDuplicate', { phone: updateFields.phone });
      if (dupCheck.duplicate) {
        return responseHandler.error(res, 'Another contact already exists with this phone number', 'CONFLICT', null, 409);
      }
    }

    if (req.file) {
      updateFields.profilePhoto = await uploadImage(req.file);
    }

    // Persist in MongoDB
    const updatedContact = await Contact.findByIdAndUpdate(
      contact._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // Sync updates to C++ Engine (deletes original and re-inserts updated copy)
    await cppBridge.sendCommand('delete', { id: contact._id.toString() });
    
    const formatted = {
      id: updatedContact._id.toString(),
      firstName: updatedContact.firstName,
      lastName: updatedContact.lastName,
      phone: updatedContact.phone,
      alternativePhone: updatedContact.alternativePhone || '',
      email: updatedContact.email || '',
      company: updatedContact.company || '',
      designation: updatedContact.designation || '',
      department: updatedContact.department || '',
      category: updatedContact.category || 'personal',
      city: updatedContact.city || '',
      state: updatedContact.state || '',
      country: updatedContact.country || '',
      zipCode: updatedContact.zipCode || '',
      website: updatedContact.website || '',
      linkedin: updatedContact.linkedin || '',
      birthday: updatedContact.birthday ? updatedContact.birthday.toISOString().split('T')[0] : '',
      notes: updatedContact.notes || '',
      tags: updatedContact.tags || [],
      isFavorite: updatedContact.isFavorite,
      isBlocked: updatedContact.isBlocked,
      lastContacted: updatedContact.lastContacted ? updatedContact.lastContacted.toISOString() : '',
      contactCount: updatedContact.contactCount || 0,
      createdAt: updatedContact.createdAt.toISOString()
    };
    
    await cppBridge.sendCommand('insert', formatted);

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'update',
      targetId: contact._id,
      metadata: { name: `${updatedContact.firstName} ${updatedContact.lastName}` }
    });

    // Create Notification
    Notification.create({
      userId: req.user.id,
      type: 'contact_updated',
      title: 'Contact Updated',
      message: `${updatedContact.firstName} ${updatedContact.lastName}'s details have been updated.`,
      referenceId: updatedContact._id
    }).catch(err => console.error('Notification create error:', err.message));

    return responseHandler.success(res, 'Contact updated successfully', { contact: updatedContact });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * Soft Delete Contact (Pushes to C++ Stack)
 */
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!contact) {
      return responseHandler.error(res, 'Contact not found', 'NOT_FOUND', null, 404);
    }

    // Sync to C++ Engine (deletes from active Trie/BST and pushes to LIFO Undo Stack)
    await cppBridge.sendCommand('delete', { id: contact._id.toString() });

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'delete',
      targetId: contact._id,
      metadata: { name: `${contact.firstName} ${contact.lastName}` }
    });

    // Create Notification
    Notification.create({
      userId: req.user.id,
      type: 'contact_deleted',
      title: 'Contact Deleted',
      message: `${contact.firstName} ${contact.lastName} has been moved to trash.`,
      referenceId: contact._id
    }).catch(err => console.error('Notification create error:', err.message));

    return responseHandler.success(res, 'Contact moved to trash successfully', { contact });
  } catch (error) {
    next(error);
  }
};

/**
 * Undo Last Delete (Pops from C++ LIFO Stack)
 */
exports.undoDelete = async (req, res, next) => {
  try {
    // 1. Query C++ Stack pop
    const cppResult = await cppBridge.sendCommand('undo');
    
    if (cppResult.status === 'error') {
      return responseHandler.error(res, cppResult.message || 'No deleted contacts available to restore', 'BAD_REQUEST', null, 400);
    }

    const restoredContact = cppResult.contact;

    // 2. Restore in MongoDB
    const contact = await Contact.findByIdAndUpdate(
      restoredContact.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'restore',
      targetId: contact._id,
      metadata: { name: `${contact.firstName} ${contact.lastName}` }
    });

    // Create Notification
    Notification.create({
      userId: req.user.id,
      type: 'contact_restored',
      title: 'Contact Restored',
      message: `${contact.firstName} ${contact.lastName} has been restored from trash.`,
      referenceId: contact._id
    }).catch(err => console.error('Notification create error:', err.message));

    return responseHandler.success(res, 'Restored last deleted contact successfully via C++ undo stack', { contact });
  } catch (error) {
    next(error);
  }
};

/**
 * Restore Contact manually from Trash (pulls from DB, inserts back to C++ active structures)
 */
exports.restoreContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!contact) {
      return responseHandler.error(res, 'Contact not found in trash', 'NOT_FOUND', null, 404);
    }

    // Insert back to active C++ structures
    const formatted = {
      id: contact._id.toString(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      alternativePhone: contact.alternativePhone || '',
      email: contact.email || '',
      company: contact.company || '',
      designation: contact.designation || '',
      department: contact.department || '',
      category: contact.category || 'personal',
      city: contact.city || '',
      state: contact.state || '',
      country: contact.country || '',
      zipCode: contact.zipCode || '',
      website: contact.website || '',
      linkedin: contact.linkedin || '',
      birthday: contact.birthday ? contact.birthday.toISOString().split('T')[0] : '',
      notes: contact.notes || '',
      tags: contact.tags || [],
      isFavorite: contact.isFavorite,
      isBlocked: contact.isBlocked,
      lastContacted: contact.lastContacted ? contact.lastContacted.toISOString() : '',
      contactCount: contact.contactCount || 0,
      createdAt: contact.createdAt.toISOString()
    };
    await cppBridge.sendCommand('insert', formatted);

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'restore',
      targetId: contact._id,
      metadata: { name: `${contact.firstName} ${contact.lastName}` }
    });

    // Create Notification
    Notification.create({
      userId: req.user.id,
      type: 'contact_restored',
      title: 'Contact Restored',
      message: `${contact.firstName} ${contact.lastName} has been restored from trash.`,
      referenceId: contact._id
    }).catch(err => console.error('Notification create error:', err.message));

    return responseHandler.success(res, 'Contact restored successfully', { contact });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk Soft Delete
 */
exports.bulkDelete = async (req, res, next) => {
  try {
    const { contactIds } = req.body;

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return responseHandler.error(res, 'Please provide an array of contact IDs', 'BAD_REQUEST', null, 400);
    }

    const result = await Contact.updateMany(
      { _id: { $in: contactIds }, userId: req.user.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );

    // Remove from active C++ index maps (We perform a sync to easily reflect bulk deletions)
    await syncAllToCpp();

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'delete',
      metadata: { count: result.modifiedCount }
    });

    return responseHandler.success(res, `${result.modifiedCount} contacts moved to trash`, {
      deletedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Favorite status
 */
exports.toggleFavorite = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false });
    if (!contact) {
      return responseHandler.error(res, 'Contact not found', 'NOT_FOUND', null, 404);
    }

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    // Update C++ Store memory values
    await cppBridge.sendCommand('delete', { id: contact._id.toString() });
    
    const formatted = {
      id: contact._id.toString(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      alternativePhone: contact.alternativePhone || '',
      email: contact.email || '',
      company: contact.company || '',
      designation: contact.designation || '',
      department: contact.department || '',
      category: contact.category || 'personal',
      city: contact.city || '',
      state: contact.state || '',
      country: contact.country || '',
      zipCode: contact.zipCode || '',
      website: contact.website || '',
      linkedin: contact.linkedin || '',
      birthday: contact.birthday ? contact.birthday.toISOString().split('T')[0] : '',
      notes: contact.notes || '',
      tags: contact.tags || [],
      isFavorite: contact.isFavorite,
      isBlocked: contact.isBlocked,
      lastContacted: contact.lastContacted ? contact.lastContacted.toISOString() : '',
      contactCount: contact.contactCount || 0,
      createdAt: contact.createdAt.toISOString()
    };
    await cppBridge.sendCommand('insert', formatted);

    return responseHandler.success(
      res,
      `Contact ${contact.isFavorite ? 'added to' : 'removed from'} favorites`,
      { isFavorite: contact.isFavorite }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Block status
 */
exports.toggleBlock = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false });
    if (!contact) {
      return responseHandler.error(res, 'Contact not found', 'NOT_FOUND', null, 404);
    }

    contact.isBlocked = !contact.isBlocked;
    await contact.save();

    // Update C++ Store memory values
    await cppBridge.sendCommand('delete', { id: contact._id.toString() });
    
    const formatted = {
      id: contact._id.toString(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      alternativePhone: contact.alternativePhone || '',
      email: contact.email || '',
      company: contact.company || '',
      designation: contact.designation || '',
      department: contact.department || '',
      category: contact.category || 'personal',
      city: contact.city || '',
      state: contact.state || '',
      country: contact.country || '',
      zipCode: contact.zipCode || '',
      website: contact.website || '',
      linkedin: contact.linkedin || '',
      birthday: contact.birthday ? contact.birthday.toISOString().split('T')[0] : '',
      notes: contact.notes || '',
      tags: contact.tags || [],
      isFavorite: contact.isFavorite,
      isBlocked: contact.isBlocked,
      lastContacted: contact.lastContacted ? contact.lastContacted.toISOString() : '',
      contactCount: contact.contactCount || 0,
      createdAt: contact.createdAt.toISOString()
    };
    await cppBridge.sendCommand('insert', formatted);

    return responseHandler.success(
      res,
      `Contact ${contact.isBlocked ? 'blocked' : 'unblocked'}`,
      { isBlocked: contact.isBlocked }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Trash list
 */
exports.getTrash = async (req, res, next) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id, isDeleted: true }).sort('-deletedAt');
    return responseHandler.success(res, 'Trash retrieved successfully', { contacts, total: contacts.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get prioritized recently contacted lists (C++ PriorityQueue Heap)
 */
exports.getRecentInteractions = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const cppResult = await cppBridge.sendCommand('getRecent', { limit: parseInt(limit) });

    return responseHandler.success(
      res,
      'Recent interactions retrieved successfully from C++ heap priority queue',
      { contacts: cppResult.contacts || [] }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Clear ALL contacts for authenticated user
 */
exports.clearAll = async (req, res, next) => {
  try {
    const result = await Contact.deleteMany({ userId: req.user.id });

    // Re-sync C++ engine (empty store)
    await syncAllToCpp();

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'clear_all',
      metadata: { count: result.deletedCount }
    });

    return responseHandler.success(res, `All ${result.deletedCount} contacts have been permanently deleted`, {
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear Trash - permanently delete all soft-deleted contacts
 */
exports.clearTrash = async (req, res, next) => {
  try {
    const result = await Contact.deleteMany({ userId: req.user.id, isDeleted: true });

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'clear_trash',
      metadata: { count: result.deletedCount }
    });

    return responseHandler.success(res, `${result.deletedCount} contacts permanently removed from trash`, {
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
