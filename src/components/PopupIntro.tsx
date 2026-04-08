import React from 'react';

type Props = {
  onClose: () => void;
};

// A lightweight modal that shows the introductory text on every site load.
export default function PopupIntro({ onClose }: Props) {
  return (
    <div className="popup-overlay" role="dialog" aria-modal="true" aria-label="Introduction">
      <div className="popup-content">
        <div className="popup-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Welcome</h3>
          <button className="popup-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="popup-body" style={{ marginTop: 8 }}>
          <p>
            This free tool allows you to estimate the computational load of an effects chain for Hotone
            processors in the Ampero II family. The interface displays a fixed signal chain, similar to
            the one found on the device screen, with effects routed in series. Please note that the values
            shown are approximations only — for accurate readings always refer to the CPU load displayed on
            your Ampero II processor.
          </p>
          <h4>How to use it:</h4>
          <ul>
            <li>Click the "+" blocks to add new effects to the chain.</li>
            <li>Drag blocks to reorder and reposition them.</li>
            <li>Monitor the CPU load at the bottom of each block, or the total load across all effects displayed both on the CPU bar at the top of the chain and in the top menu.</li>
            <li>Use the Export/Import feature to save and restore your configurations.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
