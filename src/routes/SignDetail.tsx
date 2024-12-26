import { Component, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sign } from '../types';
import { PreviewSign } from '../view_preview';
import { SettingsSign } from '../view_settings';
import '../styles/layout.scss';
import { useSignStore } from '@/store/SignContext';
import * as Yaml from 'yaml';

// Wrapper to convert class component to function component to use hooks
export function SignDetailWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { loadSigns, getSignById: getSignByName, signs } = useSignStore();

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


    return <SignDetail id={id} navigate={navigate} sign={sign} signs={signs} />;
}

interface SignDetailProps {
    id: string | undefined;
    sign: Sign;
    signs: Sign[];
    navigate: (path: string) => void;
}

interface SignDetailState {
    sign: Sign;
    saving: boolean;
    dirty: boolean;
}

export class SignDetail extends Component<SignDetailProps, SignDetailState> {
    constructor(props: SignDetailProps) {
        super(props);
        this.state = { sign: props.sign, saving: false, dirty: false };
    }

    onChange() {
        this.setState({ dirty: true });
    }

    async save() {
        if (this.state.saving || !this.state.sign) return;

        const otherSigns = this.props.signs.filter(s => s.uniqueId !== this.state.sign.uniqueId);
        const signs = {
          signs: [
            this.state.sign,
            ...otherSigns
          ]
        }
        const yaml = Yaml.stringify(signs, (key, value) => key === '__type__' ? undefined : value)

        try {
            this.setState({ saving: true });
            await navigator.clipboard.writeText(yaml);
            this.setState({ saving: false, dirty: false });
            alert("Yaml copied to clipboard");
        } catch (err) {
            console.error("Failed to copy to clipboard:", err);
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