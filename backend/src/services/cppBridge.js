const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

class CppBridge {
  constructor() {
    this.childProcess = null;
    this.responseQueue = [];
    this.buffer = '';
    this.isInitialized = false;
  }

  /**
   * Reject and clear all pending promises in queue
   */
  clearQueue(error) {
    while (this.responseQueue.length > 0) {
      const { reject } = this.responseQueue.shift();
      reject(error);
    }
  }

  /**
   * Spawn C++ Child Process
   */
  init() {
    if (this.childProcess) return;

    // Resolve binary path
    let binaryPath = path.resolve(__dirname, '../../', env.CPP_ENGINE_PATH);

    // Append .exe extension on Windows if missing
    if (process.platform === 'win32' && !binaryPath.endsWith('.exe')) {
      if (fs.existsSync(binaryPath + '.exe')) {
        binaryPath += '.exe';
      }
    }

    console.log(`📡 Spawning C++ Engine: ${binaryPath}`);

    if (!fs.existsSync(binaryPath)) {
      console.error(`❌ C++ Engine binary not found at: ${binaryPath}. Please compile the engine first.`);
      return;
    }

    try {
      this.childProcess = spawn(binaryPath, [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Handle spawn error directly on childProcess
      this.childProcess.on('error', (err) => {
        console.error('❌ C++ Process Error:', err.message);
        this.isInitialized = false;
        this.childProcess = null;
        this.clearQueue(new Error(`C++ process error: ${err.message}`));
      });

      // Protect against EPIPE crashes on stdin
      if (this.childProcess.stdin) {
        this.childProcess.stdin.on('error', (err) => {
          console.error('⚠️ C++ stdin stream error (EPIPE prevented):', err.message);
        });
      }

      // Handle output streams
      this.childProcess.stdout.setEncoding('utf-8');
      this.childProcess.stdout.on('data', (data) => this.handleData(data));

      this.childProcess.stderr.on('data', (data) => {
        console.error(` C++ Engine Log: ${data.toString().trim()}`);
      });

      this.childProcess.on('close', (code) => {
        console.warn(`⚠️ C++ child process exited with code ${code}`);
        this.childProcess = null;
        this.isInitialized = false;
        this.clearQueue(new Error(`C++ process terminated unexpectedly (exit code ${code})`));
      });

      this.isInitialized = true;
      console.log('🟢 C++ Integration Bridge ready');
    } catch (error) {
      console.error('❌ Failed to spawn C++ child process:', error.message);
    }
  }

  /**
   * Process streams data chunk by chunk (splits on newline)
   */
  handleData(data) {
    this.buffer += data;
    let newlineIndex = this.buffer.indexOf('\n');

    while (newlineIndex !== -1) {
      const line = this.buffer.substring(0, newlineIndex).trim();
      this.buffer = this.buffer.substring(newlineIndex + 1);
      
      if (line) {
        try {
          const response = JSON.parse(line);
          const promisePair = this.responseQueue.shift();
          if (promisePair) {
            promisePair.resolve(response);
          }
        } catch (error) {
          console.error('❌ Failed to parse C++ output JSON:', error.message, 'Raw line:', line);
          const promisePair = this.responseQueue.shift();
          if (promisePair) {
            promisePair.reject(error);
          }
        }
      }
      newlineIndex = this.buffer.indexOf('\n');
    }
  }

  /**
   * Send command to C++ child process asynchronously
   */
  sendCommand(command, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized || !this.childProcess) {
        // Automatically attempt to re-initialize
        this.init();
        if (!this.childProcess) {
          return reject(new Error('C++ child process is not running'));
        }
      }

      if (!this.childProcess.stdin || !this.childProcess.stdin.writable) {
        return reject(new Error('C++ child process stdin is not writable'));
      }

      const payload = JSON.stringify({ command, params }) + '\n';
      
      // Store callbacks
      this.responseQueue.push({ resolve, reject });

      // Write to C++ stdin with error callback
      this.childProcess.stdin.write(payload, (err) => {
        if (err) {
          console.error('⚠️ Failed to write to C++ stdin:', err.message);
          const idx = this.responseQueue.findIndex(p => p.reject === reject);
          if (idx !== -1) {
            this.responseQueue.splice(idx, 1);
          }
          reject(err);
        }
      });
    });
  }

  /**
   * Close connection gracefully
   */
  close() {
    if (this.childProcess) {
      try {
        if (this.childProcess.stdin) {
          this.childProcess.stdin.end();
        }
        this.childProcess.kill();
      } catch (err) {
        // ignore
      }
      this.childProcess = null;
      this.isInitialized = false;
      this.clearQueue(new Error('C++ bridge closed'));
    }
  }
}

// Export singleton instance
module.exports = new CppBridge();
