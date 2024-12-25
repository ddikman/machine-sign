import { Component } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sign } from '../data';
import { PreviewSign } from '../view_preview';
import { SettingsSign } from '../view_settings';
import { debounce } from 'ts-debounce';
import '../styles/layout.scss';

// Wrapper to convert class component to function component to use hooks
export function SignDetailWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();
    return <SignDetail id={id ? parseInt(id) : null} navigate={navigate} />;
}

interface SignDetailProps {
    id: number | null;
    navigate: (path: string) => void;
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
        if (this.props.id === null) {
            const sign = new Sign();
            sign.name = "New Sign";
            this.setState({ sign, saving: false, dirty: false });
            console.log('Loaded new page with empty sign');
            return;
        }

        // TODO: Implement using local data
        // try {
        //     const response = await fetch(`data/signs/${this.props.id}`);
        //     const json = await response.json();
        //     const sign = new Sign();
        //     initializeWithJson(sign, json.data.data);
        //     this.setState({ sign, saving: false, dirty: false });
        // } catch (error) {
        //     console.error(error);
        //     this.props.navigate('/');
        // }
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
                this.props.id !== null ? `data/signs/${this.props.id}` : 'data/signs',
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