import { useNavigate } from 'react-router-dom';
import '@/styles/layout.scss';

export function SignList() {
    const navigate = useNavigate();

    const readSigns = () => {
        return [];
    };

    const signs = readSigns();

    return (
        <div className="app-root" style={{ padding: '10mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>MakerSpace Sign Maker</h1>
            {signs.length === 0 ? (
                <div className="empty-state">
                    <p>No signs are created yet, be the first to add a sign now!</p>
                    <button onClick={() => navigate('/sign')}>Add sign</button>
                </div>
            ) : (
                // Will handle list view later
                <div></div>
            )}
        </div>
    );
}