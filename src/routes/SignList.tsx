import { useNavigate } from 'react-router-dom';
import { SignSelector } from '@/components/SignSelector';
import '@/styles/layout.scss';

export function SignList() {
    const navigate = useNavigate();

    return (
        <div className="app-root">
            <SignSelector
                selectedId={null}
                onOpen={(id: number | null) => {
                    navigate(id === null ? '/new' : `/${id}`);
                }}
            />
        </div>
    );
}