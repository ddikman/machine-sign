import { Component, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sign } from '../types';
import { PreviewSign } from '../view_preview';
import { SettingsSign } from '../view_settings';
import { debounce } from 'ts-debounce';
import '../styles/layout.scss';
import { useSignStore } from '@/store/SignContext';

// Wrapper to convert class component to function component to use hooks
export function SignDetailWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loadSigns, getSignByName } = useSignStore();

    useEffect(() => {
        loadSigns();
    }, [loadSigns]);

    return <SignDetail id={id} navigate={navigate} getSignByName={getSignByName} />;
}

interface SignDetailProps {
    id: string | undefined;
    navigate: (path: string) => void;
    getSignByName: (name: string) => Sign | undefined;
}

interface SignDetailState {
    sign: Sign | null;
    saving: boolean;
    dirty: boolean;
}

export class SignDetail extends Component<SignDetailProps, SignDetailState> {
    debouncedSave = debounce(() => this.save(), 2000);

    constructor(props: SignDetailProps) {
        super(props);
        this.state = { sign: null, saving: false, dirty: false };
    }

    componentDidMount() {
        this.loadSign();
    }

    componentDidUpdate(prevProps: SignDetailProps) {
        if (prevProps.id !== this.props.id) {
            this.loadSign();
        }
    }

    async loadSign() {
        if (!this.props.id) {
            const sign = new Sign();
            sign.name = "New Sign";
            this.setState({ sign, saving: false, dirty: false });
            console.log('Loaded new page with empty sign');
            return;
        }

        const existingSign = this.props.getSignByName(this.props.id);
        if (existingSign) {
            this.setState({ sign: existingSign, saving: false, dirty: false });
        } else {
            console.error('Sign not found');
            this.props.navigate('/');
        }
    }

    onChange() {
        this.setState({ dirty: true });
        this.debouncedSave();
    }

    async save() {
        if (this.state.saving || !this.state.sign) return;

        this.setState({ saving: true });
        try {
            const response = await fetch(
                this.props.id !== null
                    ? `${import.meta.env.BASE_URL}data/signs/${this.props.id}`
                    : `${import.meta.env.BASE_URL}data/signs`,
                {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.state.sign)
                }
            );
            const json = await response.json();

            if (this.props.id === null) {
                this.props.navigate(`/${json.data.id}`);
            }
            this.setState({ dirty: false });
        } finally {
            this.setState({ saving: false });
        }
    }

    render() {
        if (!this.state.sign) return <div>Loading...</div>;

        return (
            <div className="app-root">
                <div id="settings">
                    <div className="sign-root">
                        <Link to={{ pathname: '/' }} style={{ color: 'white', marginBottom: '5mm', display: 'block' }}>Back to list</Link>
                        <SettingsSign
                            sign={this.state.sign}
                            onChange={() => this.onChange()}
                            onSave={() => this.save()}
                            onDelete={null}
                            autosaved={this.props.id !== null}
                            saving={this.state.saving ? 'saving' : (this.state.dirty ? 'dirty' : 'saved')}
                        />
                    </div>
                </div>
                <div id="preview">
                    <PreviewSign sign={this.state.sign} id={this.props.id} />
                </div>
            </div>
        );
    }
}