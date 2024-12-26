import { Component, useEffect, useState } from 'react';
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
    const [loading, setLoading] = useState(false);
    const { loadSigns, getSignById: getSignByName } = useSignStore();

    useEffect(() => {
        setLoading(true);
        loadSigns();
        setLoading(false);
    }, [loadSigns]);

    if (loading) return <div>Loading...</div>;

    let sign: Sign;
    if (id) {
        const matchingSign = getSignByName(id);
        if (!matchingSign) {
            return <div>Sign not found</div>;
        }
        sign = matchingSign;
    } else {
        sign = new Sign();
    }


    return <SignDetail id={id} navigate={navigate} sign={sign} />;
}

interface SignDetailProps {
    id: string | undefined;
    sign: Sign;
    navigate: (path: string) => void;
}

interface SignDetailState {
    sign: Sign;
    saving: boolean;
    dirty: boolean;
}

export class SignDetail extends Component<SignDetailProps, SignDetailState> {
    debouncedSave = debounce(() => this.save(), 2000);

    constructor(props: SignDetailProps) {
        super(props);
        this.state = { sign: props.sign, saving: false, dirty: false };
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
                    ? `/data/signs/${this.props.id}`
                    : `/data/signs`,
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
                    <PreviewSign sign={this.state.sign} id={this.props.id ?? null} />
                </div>
            </div>
        );
    }
}