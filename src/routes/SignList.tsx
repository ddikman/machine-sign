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
      </div>
    );
}