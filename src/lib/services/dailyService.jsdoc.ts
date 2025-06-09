/**
 * @fileoverview Daily.co Service for audio/video call functionality
 * 
 * This service provides a wrapper around the Daily.co SDK to handle audio and video
 * calls in the Fintan Virtual Care Hub application. It manages call initialization,
 * audio/video controls, screen sharing, and video request/consent flow.
 * 
 * @module dailyService
 */

import DailyIframe from '@daily-co/daily-js';

/**
 * Options for initializing a call
 * @typedef {Object} CallOptions
 * @property {boolean} [video=true] - Whether to enable video initially
 * @property {boolean} [audio=true] - Whether to enable audio initially
 */

/**
 * Daily Service for managing audio/video calls
 */
export const dailyService = {
  /**
   * The Daily.co call object
   * @private
   */
  callObject: null,

  /**
   * Whether audio is currently enabled
   * @private
   */
  isAudioEnabled: true,

  /**
   * Whether video is currently enabled
   * @private
   */
  isVideoEnabled: true,

  /**
   * Whether screen sharing is currently active
   * @private
   */
  isScreenSharing: false,

  /**
   * Initializes a call with Daily.co
   * 
   * @param {string} roomUrl - URL of the Daily.co room
   * @param {string} token - Secure token for joining the room
   * @param {CallOptions} [options] - Optional call configuration
   * @returns {Promise<boolean>} - Promise resolving to a boolean indicating success
   * 
   * @example
   * // Initialize a call with default options (audio and video enabled)
   * await dailyService.initializeCall('https://example.daily.co/room123', 'token');
   * 
   * @example
   * // Initialize an audio-only call
   * await dailyService.initializeCall('https://example.daily.co/room123', 'token', { video: false });
   */
  async initializeCall(roomUrl, token, options = { video: true, audio: true }) {
    try {
      // Create the call object
      this.callObject = DailyIframe.createCallObject({
        url: roomUrl,
        token: token,
        dailyConfig: {
          experimentalChromeVideoMuteLightOff: true,
          useDevicePreferenceCookies: true,
        },
      });

      // Join the call
      await this.callObject.join({
        url: roomUrl,
        token: token,
        showLocalVideo: true,
        showParticipantsBar: true,
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      // Set initial audio/video state
      this.isAudioEnabled = options.audio;
      this.isVideoEnabled = options.video;

      if (!options.audio) {
        await this.callObject.setLocalAudio(false);
      }

      if (!options.video) {
        await this.callObject.setLocalVideo(false);
      }

      return true;
    } catch (error) {
      console.error('Error initializing call:', error);
      return false;
    }
  },

  /**
   * Toggles the local audio on/off
   * 
   * @returns {Promise<boolean>} - Promise resolving to a boolean indicating success
   * 
   * @example
   * // Toggle audio mute state
   * const success = await dailyService.toggleAudio();
   * if (success) {
   *   console.log('Audio is now', dailyService.isAudioEnabled ? 'enabled' : 'disabled');
   * }
   */
  async toggleAudio() {
    if (!this.callObject) return false;

    try {
      await this.callObject.setLocalAudio(!this.isAudioEnabled);
      this.isAudioEnabled = !this.isAudioEnabled;
      return true;
    } catch (error) {
      console.error('Error toggling audio:', error);
      return false;
    }
  },

  /**
   * Toggles the local video on/off
   * 
   * @returns {Promise<boolean>} - Promise resolving to a boolean indicating success
   * 
   * @example
   * // Toggle video state
   * const success = await dailyService.toggleVideo();
   * if (success) {
   *   console.log('Video is now', dailyService.isVideoEnabled ? 'enabled' : 'disabled');
   * }
   */
  async toggleVideo() {
    if (!this.callObject) return false;

    try {
      await this.callObject.setLocalVideo(!this.isVideoEnabled);
      this.isVideoEnabled = !this.isVideoEnabled;
      return true;
    } catch (error) {
      console.error('Error toggling video:', error);
      return false;
    }
  },

  /**
   * Enables the local video
   * 
   * @returns {Promise<boolean>} - Promise resolving to a boolean indicating success
   * 
   * @example
   * // Enable video after receiving consent
   * const success = await dailyService.enableVideo();
   */
  async enableVideo() {
    if (!this.callObject) return false;

    try {
      await this.callObject.setLocalVideo(true);
      this.isVideoEnabled = true;
      return true;
    } catch (error) {
      console.error('Error enabling video:', error);
      return false;
    }
  },

  /**
   * Toggles screen sharing on/off
   * 
   * @returns {Promise<boolean>} - Promise resolving to a boolean indicating success
   * 
   * @example
   * // Toggle screen sharing
   * const success = await dailyService.shareScreen();
   */
  async shareScreen() {
    if (!this.callObject) return false;

    try {
      const participants = this.callObject.participants();
      const isCurrentlySharing = participants.local.screen;

      if (isCurrentlySharing) {
        await this.callObject.stopScreenShare();
      } else {
        await this.callObject.startScreenShare();
      }

      this.isScreenSharing = !isCurrentlySharing;
      return true;
    } catch (error) {
      console.error('Error toggling screen share:', error);
      return false;
    }
  },

  /**
   * Sends a request to enable video (for providers in audio calls)
   * 
   * @returns {Promise<boolean>} - Promise resolving to a boolean indicating success
   * 
   * @example
   * // Provider requests video from patient
   * const success = await dailyService.sendVideoRequest();
   */
  async sendVideoRequest() {
    if (!this.callObject) return false;

    try {
      await this.callObject.sendAppMessage({ type: 'video-request' }, '*');
      return true;
    } catch (error) {
      console.error('Error sending video request:', error);
      return false;
    }
  },

  /**
   * Sends a response to a video request
   * 
   * @param {boolean} accepted - Boolean indicating if the request was accepted
   * @returns {Promise<boolean>} - Promise resolving to a boolean indicating success
   * 
   * @example
   * // Patient accepts video request
   * const success = await dailyService.sendVideoRequestResponse(true);
   * 
   * @example
   * // Patient declines video request
   * const success = await dailyService.sendVideoRequestResponse(false);
   */
  async sendVideoRequestResponse(accepted) {
    if (!this.callObject) return false;

    try {
      await this.callObject.sendAppMessage({ 
        type: 'video-request-response', 
        accepted 
      }, '*');
      return true;
    } catch (error) {
      console.error('Error sending video request response:', error);
      return false;
    }
  },

  /**
   * Registers a callback for when a video request is received
   * 
   * @param {Function} callback - Function to call when a video request is received
   * 
   * @example
   * // Set up a handler for video requests
   * dailyService.onVideoRequestReceived(() => {
   *   // Show consent dialog to patient
   *   setShowVideoConsentPrompt(true);
   * });
   */
  onVideoRequestReceived(callback) {
    if (!this.callObject) return;

    this.callObject.on('app-message', (event) => {
      if (event.data.type === 'video-request') {
        callback();
      }
    });
  },

  /**
   * Registers a callback for when a video request response is received
   * 
   * @param {Function} callback - Function to call when a video request response is received
   * 
   * @example
   * // Set up a handler for video request responses
   * dailyService.onVideoRequestResponseReceived((accepted) => {
   *   if (accepted) {
   *     console.log('Patient accepted video request');
   *   } else {
   *     console.log('Patient declined video request');
   *   }
   * });
   */
  onVideoRequestResponseReceived(callback) {
    if (!this.callObject) return;

    this.callObject.on('app-message', (event) => {
      if (event.data.type === 'video-request-response') {
        callback(event.data.accepted);
      }
    });
  },

  /**
   * Ends the current call and cleans up resources
   * 
   * @returns {Promise<void>} - Promise that resolves when the call has ended
   * 
   * @example
   * // End the call and clean up
   * await dailyService.endCall();
   */
  async endCall() {
    if (!this.callObject) return;

    try {
      await this.callObject.leave();
      this.callObject.destroy();
      this.callObject = null;
      this.isAudioEnabled = true;
      this.isVideoEnabled = true;
      this.isScreenSharing = false;
    } catch (error) {
      console.error('Error ending call:', error);
    }
  },

  /**
   * Gets the Daily.co call object for advanced usage
   * 
   * @returns {Object} - The Daily.co call object
   * 
   * @example
   * // Get the call object for advanced operations
   * const callObject = dailyService.getCallObject();
   * callObject.updateInputSettings({ video: { deviceId: 'preferred-camera-id' } });
   */
  getCallObject() {
    return this.callObject;
  }
};

