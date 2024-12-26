import { useNavigate } from 'react-router-dom';
import '@/styles/layout.scss';
import { useEffect } from 'react';
import { useSignStore } from '@/store/SignContext';
import './SignList.css';

export function SignList() {
    const navigate = useNavigate();
    const { signs, loadSigns } = useSignStore();

    useEffect(() => {
        loadSigns();
    }, [loadSigns]);

    return (
      <div className="container">
        <div className="card">
          <div className="header">
            <h1>MakerSpace Machine Sign</h1>
            <button
              className="create-button"
              onClick={() => navigate('/sign')}
            >
              Create new machine sign
            </button>
          </div>
          <ul className="machine-list">
            {signs.map(sign => (
              <li
                key={sign.uniqueId}
                className="machine-item"
                onClick={() => navigate(`/sign/${sign.uniqueId}`)}
              >
                <p className="machine-name">{sign.name}</p>
                <p className="machine-model">{sign.model}</p>
                <p className="machine-update">
                  Last updated: {new Date(sign.lastUpdated).toLocaleString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                  })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <a
          href="https://github.com/ddikman/machine-sign"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: '#666',
            textDecoration: 'none'
          }}
        >
          <svg height="16" width="16" viewBox="0 0 16 16" style={{ fill: 'currentColor' }}>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Fork this on GitHub
        </a>
      </div>
      </div>
    );
}