import { useNavigate } from 'react-router-dom';
import '@/styles/layout.scss';
import { useEffect } from 'react';
import { useSignStore } from '@/store/SignContext';

export function SignList() {
    const navigate = useNavigate();
    const { signs, loadSigns } = useSignStore();

    useEffect(() => {
        loadSigns();
    }, [loadSigns]);

    return (
        <div className="app-root" style={{ padding: '10mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>MakerSpace Sign Maker</h1>
            {signs.length === 0 ? (
                <div className="empty-state">
                    <p>No signs are created yet, be the first to add a sign now!</p>
                    <button onClick={() => navigate('/sign')}>Add sign</button>
                </div>
            ) : (
                <div className="sign-list">
                    {signs.map((sign, index) => (
                        <div key={index} className="sign-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/sign/${sign.name}`)}>
                            <h3>{sign.name}</h3>
                            <p>{sign.model}</p>
                        </div>
                    ))}
                    <div className="add-sign">
                        <button onClick={() => navigate('/sign')}>Add New Sign</button>
                    </div>
                </div>
            )}
        </div>
    );
}