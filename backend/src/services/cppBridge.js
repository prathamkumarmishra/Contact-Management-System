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
        
        // Reject all outstanding requests in queue
        while (this.responseQueue.length > 0) {
          const { reject } = this.responseQueue.shift();
          reject(new Error('C++ process terminated unexpectedly'));
        }
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

      const payload = JSON.stringify({ command, params }) + '\n';
      
      // Store callbacks
      this.responseQueue.push({ resolve, reject });

      // Write to C++ stdin
      this.childProcess.stdin.write(payload);
    });
  }

  /**
   * Close connection gracefully
   */
  close() {
    if (this.childProcess) {
      this.childProcess.stdin.end();
      this.childProcess.kill();
      this.childProcess = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
module.exports = new CppBridge();
