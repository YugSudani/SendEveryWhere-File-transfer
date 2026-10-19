import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  FileIcon,
  FolderIcon,
  CloudUploadIcon,
  UserIcon,
  MailIcon,
  SendIcon,
  CheckIcon,
  CopyIcon,
  CloseIcon,
  DownloadIcon,
  RefreshIcon,
  KeyIcon,
} from './Icons.jsx';
import { MAX_FILE_SIZE_MB, MAX_FILES_COUNT } from '../utils/validators.js';
import { useUpload } from '../features/send/useUpload.js';
import { useDownload } from '../features/receive/useDownload.js';
import { CodeBoxes } from './CodeBoxes.jsx';
import { getAbsoluteDownloadUrl } from '../api/files.js';
import { useCopy } from '../hooks/useCopy.js';
import { useCountdown } from '../hooks/useCountdown.js';
import { formatBytes, formatCountdown } from '../utils/formatBytes.js';

export function SendoraCard({ mode = 'send', onModeChange }) {
  // Upload hook
  const {
    files,
    progress,
    uploading,
    result,
    error: uploadError,
    appendFiles,
    removeFile,
    clear: clearUpload,
    startUpload,
  } = useUpload();

  // Download hook
  const {
    code: receiveCode,
    setCode: setReceiveCode,
    info: downloadInfo,
    loading: downloadLoading,
    error: downloadError,
    lookup: lookupCode,
    downloadUrl,
    reset: resetDownload,
  } = useDownload();

  const { copied, copy } = useCopy();
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'folders'
  const [isPrivate, setIsPrivate] = useState(true);
  const [downloadingState, setDownloadingState] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Countdown timers
  const { remaining: sendRemaining } = useCountdown(result?.expiresAt);
  const { remaining: receiveRemaining } = useCountdown(downloadInfo?.expiresAt);

  // Drag and drop handler
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer?.files?.length) {
      appendFiles(e.dataTransfer.files);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function openFolderPicker() {
    folderInputRef.current?.click();
  }

  function handleDownloadClick() {
    setDownloadingState(true);
    setTimeout(() => {
      setDownloadingState(false);
    }, 3000);
  }

  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="sendora-card-layout-group">
      {/* MAIN CARD (Fixed dimensions, never shifts or glitches) */}
      <div className="sendora-card">
        {mode === 'send' ? (
          <>
            {/* Top segmented buttons: Add Files / Add Folders */}
            {!result && !uploading && (
              <div className="card-top-tabs">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('files');
                    openFilePicker();
                  }}
                >
                  <FileIcon size={18} color="#3b82f6" />
                  <span>Add Files</span>
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'folders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('folders');
                    openFolderPicker();
                  }}
                >
                  <FolderIcon size={18} color="#3b82f6" />
                  <span>Add Folders</span>
                </button>
              </div>
            )}

            {/* Hidden file & folder inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.length) {
                  appendFiles(e.target.files);
                  e.target.value = '';
                }
              }}
            />
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.length) {
                  appendFiles(e.target.files);
                  e.target.value = '';
                }
              }}
            />

            {/* MAIN TRANSFER VIEW (Fixed height & clean layout) */}
            {!result && !uploading && (
              <>
                {/* Dropzone with stable height */}
                <div
                  className={`sendora-dropzone ${dragging ? 'dropzone-active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={activeTab === 'folders' ? openFolderPicker : openFilePicker}
                  role="button"
                  tabIndex={0}
                >
                  <div className="dropzone-icon-circle">
                    <CloudUploadIcon size={26} color={files.length > 0 ? '#3b82f6' : '#94a3b8'} />
                  </div>
                  
                  {files.length === 0 ? (
                    <>
                      <h3 className="dropzone-heading">Choose a file or drag & drop it here.</h3>
                      <p className="dropzone-sub">Max size: {MAX_FILE_SIZE_MB}MB per file, up to {MAX_FILES_COUNT} files</p>
                      <button
                        type="button"
                        className="btn-browse"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilePicker();
                        }}
                      >
                        Browse files
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="dropzone-heading text-blue-600">
                        {files.length} {files.length === 1 ? 'file' : 'files'} attached ({formatBytes(totalBytes)})
                      </h3>
                      <p className="dropzone-sub">Drag more files or click to add</p>
                      <button
                        type="button"
                        className="btn-browse"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilePicker();
                        }}
                      >
                        + Add more
                      </button>
                    </>
                  )}
                </div>

                {/* Selected files preview (inside card, max height, scrollable) */}
                {files.length > 0 && (
                  <div className="selected-files-preview">
                    <div className="selected-files-header">
                      <span className="selected-files-title">
                        {files.length} {files.length === 1 ? 'file' : 'files'} ({formatBytes(totalBytes)})
                      </span>
                      <button
                        type="button"
                        className="selected-files-clear"
                        onClick={clearUpload}
                        title="Remove all files"
                      >
                        Clear
                      </button>
                    </div>
                    <ul className="selected-file-list">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="selected-file-item">
                          <div className="selected-file-info">
                            <FileIcon size={14} color="#3b82f6" />
                            <span className="selected-file-name" title={f.name}>
                              {f.name}
                            </span>
                          </div>
                          <div className="selected-file-actions">
                            <span className="selected-file-size">
                              {formatBytes(f.size)}
                            </span>
                            <button
                              type="button"
                              className="selected-file-remove"
                              onClick={() => removeFile(i)}
                              title={`Remove ${f.name}`}
                              aria-label={`Remove ${f.name}`}
                            >
                              <CloseIcon size={12} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Error Banner */}
                {uploadError && <div className="sendora-error-banner">{uploadError}</div>}

                {/* Start Transfer Button */}
                <button
                  type="button"
                  className="btn-start-transfer"
                  disabled={files.length === 0}
                  onClick={startUpload}
                >
                  <SendIcon size={18} color="#ffffff" />
                  <span>Start Transfer</span>
                </button>
              </>
            )}

            {/* UPLOADING & FILE TRANSFERRING ANIMATION */}
            {uploading && (
              <div className="transfer-animating-box">
                <div className="transfer-pulse-ring">
                  <div className="transfer-beam-glow" />
                  <div className="transfer-icon-float">
                    <CloudUploadIcon size={42} color="#3b82f6" />
                  </div>
                </div>

                <h3 className="transfer-status-title">Transferring files securely…</h3>
                <p className="transfer-status-sub">
                  Encrypting and streaming {files.length} {files.length === 1 ? 'file' : 'files'} ({formatBytes(totalBytes)})
                </p>

                <div className="transfer-progress-bar-container">
                  <div
                    className="transfer-progress-fill"
                    style={{ width: `${Math.max(6, progress)}%` }}
                  >
                    <div className="transfer-progress-shimmer" />
                  </div>
                </div>

                <div className="transfer-metrics">
                  <span className="transfer-percent">{progress}%</span>
                  <span className="transfer-speed">Fast encrypted channel</span>
                </div>
              </div>
            )}

            {/* SUCCESS / CODE RESULT STATE */}
            {result && !uploading && (
              <div className="transfer-success-box">
                <div className="success-badge-icon">
                  <CheckIcon size={28} color="#10b981" />
                </div>
                <h3 className="success-title">Files Ready to Share!</h3>
                <p className="success-sub">Share this 6-digit code with the receiver:</p>

                <div
                  className="code-card"
                  onClick={() => copy(result.code)}
                  title="Click to copy code"
                >
                  <span className="code-text">{result.code}</span>
                  <button type="button" className="code-copy-chip">
                    {copied ? (
                      <>
                        <CheckIcon size={14} color="#10b981" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon size={14} color="#3b82f6" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="countdown-chip">
                  <span className="countdown-dot" />
                  <span>Code expires in {formatCountdown(sendRemaining)}</span>
                </div>

                <button
                  type="button"
                  className="qr-toggle"
                  onClick={() => setShowQr((v) => !v)}
                  aria-expanded={showQr}
                >
                  {showQr ? 'Hide QR code' : 'Show QR code'}
                </button>

                {showQr && (
                  <div className="qr-block">
                    <div className="qr-frame">
                      <QRCodeSVG
                        value={getAbsoluteDownloadUrl(result.code)}
                        size={168}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="M"
                      />
                    </div>
                    <p className="qr-caption">
                      Scan with a phone camera to download directly
                    </p>
                  </div>
                )}

                <div className="success-action-row">
                  <button
                    type="button"
                    className="btn-action-primary"
                    onClick={() => copy(result.code)}
                  >
                    {copied ? 'Code Copied' : 'Copy Transfer Code'}
                  </button>
                  <button
                    type="button"
                    className="btn-action-secondary"
                    onClick={() => {
                      setShowQr(false);
                      clearUpload();
                    }}
                  >
                    <RefreshIcon size={15} />
                    <span>Send More</span>
                  </button>
                </div>
              </div>
            )}

            {/* Social Proof Footer */}
            <div className="card-social-proof">
              <div className="avatar-group">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces"
                  alt="User avatar"
                  className="avatar-img"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces"
                  alt="User avatar"
                  className="avatar-img"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces"
                  alt="User avatar"
                  className="avatar-img"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces"
                  alt="User avatar"
                  className="avatar-img"
                />
              </div>
              <span className="social-proof-text">
                — Trusted by 350k+ users and companies
              </span>
            </div>

            {/* Mode Switch link */}
            <div className="card-switch-mode">
              <span>Need to download files?</span>
              <button
                type="button"
                className="switch-link"
                onClick={() => onModeChange?.('receive')}
              >
                Enter 6-digit code →
              </button>
            </div>
          </>
        ) : (
          /* RECEIVE MODE VIEW */
          <div className="receive-mode-container">
            <div className="receive-header">
              <h2 className="receive-title">Receive Files</h2>
              <p className="receive-sub">Enter the 6-digit key shared by the sender to download files.</p>
            </div>

            <form
              className="receive-form"
              onSubmit={(e) => {
                e.preventDefault();
                lookupCode(receiveCode);
              }}
            >
              <CodeBoxes
                value={receiveCode}
                onChange={setReceiveCode}
                disabled={downloadLoading}
                onComplete={(next) => {
                  if (!downloadLoading) lookupCode(next);
                }}
              />
              <div className="code-hint-row">
                <span className="code-progress">{receiveCode.length}/6 digits</span>
                {receiveCode && (
                  <button
                    type="button"
                    className="code-clear-btn"
                    disabled={downloadLoading}
                    onClick={() => resetDownload()}
                  >
                    Clear code
                  </button>
                )}
              </div>

              {downloadError && <div className="sendora-error-banner">{downloadError}</div>}

              <button
                type="submit"
                className="btn-start-transfer"
                disabled={downloadLoading || receiveCode.trim().length !== 6}
              >
                {downloadLoading ? (
                  <span className="btn-loading-flex">
                    <span className="spinner-dot" />
                    <span>Searching files…</span>
                  </span>
                ) : (
                  <>
                    <DownloadIcon size={18} color="#ffffff" />
                    <span>Find & Download Files</span>
                  </>
                )}
              </button>
            </form>

            {/* Download Files Found State */}
            {downloadInfo && (
              <div className="download-found-card">
                <div className="download-found-header">
                  <div>
                    <h4 className="found-title">Files available</h4>
                    <span className="found-meta">
                      {downloadInfo.files?.length} files ({formatBytes(downloadInfo.totalSize)})
                    </span>
                  </div>
                  <div className="countdown-badge">
                    <span>Expires in {formatCountdown(receiveRemaining)}</span>
                  </div>
                </div>

                <ul className="download-file-list">
                  {downloadInfo.files?.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="download-file-item">
                      <div className="file-info-group">
                        <FileIcon size={16} color="#3b82f6" />
                        <span className="download-file-name">{f.name}</span>
                      </div>
                      <span className="download-file-size">{formatBytes(f.size)}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={downloadUrl()}
                  className={`btn-download-now ${downloadingState ? 'downloading' : ''}`}
                  onClick={handleDownloadClick}
                >
                  <DownloadIcon size={18} />
                  <span>
                    {downloadingState ? 'Starting Download…' : `Download ${downloadInfo.files?.length > 1 ? 'All as ZIP' : 'File'}`}
                  </span>
                </a>
              </div>
            )}

            {/* Back to send link */}
            <div className="card-switch-mode">
              <span>Want to send files instead?</span>
              <button
                type="button"
                className="switch-link"
                onClick={() => onModeChange?.('send')}
              >
                ← Back to Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DEDICATED FILES SIDE CARD (Appears cleanly on the side, eliminating glitches) */}
      {mode === 'send' && files.length > 0 && !result && !uploading && null}
    </div>
  );
}
