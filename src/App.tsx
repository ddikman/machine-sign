import './style.scss';
import { JSON } from "ta-json";
import { PreviewSign } from './view_preview';
import { Sign } from './data';
import { SettingsSign } from './view_settings';
import { debounce } from 'ts-debounce';
import { Component } from 'react';

function initializeWithJson(obj: Sign, json: Record<string, unknown>) {
    // TODO: Re-implement this
    console.log("initializeWithJson", obj, json);
    throw new Error("Not implemented");
}



interface SignMeta {
    id: number
    name: string,
    model: string,
}

function SignItem({ item, onOpen }: { item: SignMeta, onOpen: () => void }) {
    return (
        <li onClick={onOpen}>
            <span>{item.name}</span>{ }<span className='selector-machine-model'>{item.model}</span>
        </li>
    )
}

interface SignSelectorProps {
    selectedId: number | null;
    onOpen: (id: null | number) => void;
}
class SignSelector extends Component<SignSelectorProps, { signs: SignMeta[] }> {
    constructor(props: SignSelectorProps) {
        super(props);
        this.state = { signs: [] }
    }

    override componentWillMount() {
        this.findSigns();
    }

    findSigns() {
        fetch("data/signs").then(response => {

            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Error " + response.status);
            }
        }).then(json => {
            this.setState({ signs: json.data });
        });
    }

    override render() {
        this.state.signs.sort((a, b) => a.name.localeCompare(b.name));
        return (
            <div className="sign-selector">
                <h1>MakerSign</h1>
                <ul>
                    <li onClick={() => this.props.onOpen(null)}>
                        <span>Create new sign</span>
                    </li>
                </ul>
                <ul>
                    {this.state.signs.map((item: SignMeta) => SignItem({ item, onOpen: () => this.props.onOpen(item.id) }))}
                </ul>
            </div>
        )
    }
}

class SignSelectorSmall extends SignSelector {

    override render() {
        return (
            <select className="sign-selector" value={this.props.selectedId != null ? this.props.selectedId : -1} onInput={e => { const id = Number((e.target as HTMLSelectElement).value); this.props.onOpen(id != -1 ? id : null); }}>
                {this.state.signs.map(item => (<option key={item.id} value={item.id}>{item.name}</option>))}
                <option value={-1}>Create new sign</option>
            </select>
        )
    }
}

export class App extends Component<object, { id: number | null, sign: Sign | null, saving: boolean, dirty: boolean }> {
    static savingIntervalMilliseconds = 2000;
    debouncedSave = debounce(() => this.save(), App.savingIntervalMilliseconds);

    constructor(props: object) {
        super(props);
        this.state = { sign: null, id: null, saving: false, dirty: false };
        this.openFromURL();
    }

    onChange() {
        console.log("Changed");
        this.setState({ dirty: true });
        this.debouncedSave();
    }

    override componentWillMount() {
        window.onpopstate = () => this.openFromURL();
        // this.openFromURL();
    }

    openFromURL() {
        const matches = window.location.pathname.match(/\/(\d+)/);
        if (matches !== null) {
            this.open(Number(matches[1]), false);
        } else {
            this.setState({ sign: null, id: null });
        }
    }

    open(id: number | null, pushState: boolean = true) {
        console.log(id);
        if (this.state.id == id && id !== null) return;

        if (id === null) {
            // Create new
            if (this.state.id !== null && pushState) {
                history.pushState({}, "", `/`);
            }

            const sign = new Sign();
            sign.name = "Test";
            this.setState({ sign: sign, id: null });
        } else {
            fetch(`data/signs/${id}`).then(r => r.json()).then(json => {
                console.log("Got response " + json);
                const item = json.data;
                const sign = new Sign();
                initializeWithJson(sign, item.data);
                this.setState({ sign: sign, id: item.id });
                if (pushState) history.pushState({}, "", `/${id}`);
            }).catch(e => {
                console.error(e);
                this.setState({ sign: null, id: null });
                history.pushState({}, "", `/`);
            });
        }
    }

    save() {
        console.log("Saving");
        if (this.state.saving) return;
        if (this.state.sign === null) return;

        fetch(this.state.id !== null ? `data/signs/${this.state.id}` : 'data/signs', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.sign)
        }).then(r => r.json()).then(json => {
            if (this.state.id === null) {
                history.pushState({}, "", `/${json.data.id}`);
            }
            this.setState({ id: json.data.id, dirty: false });
        }).finally(() => {
            this.setState({ saving: false });
        });
    }

    delete() {

    }

    override render() {
        if (this.state.sign != null) {
            return (
                <div className="app-root">
                    <div id="settings">
                        <div className="sign-root">
                            <SignSelectorSmall selectedId={this.state.id} onOpen={(id: number | null) => this.open(id)} />
                            <SettingsSign sign={this.state.sign} onChange={() => this.onChange()} onSave={() => this.save()} onDelete={null} autosaved={this.state.id !== null} saving={this.state.saving ? 'saving' : (this.state.dirty ? 'dirty' : 'saved')} />
                        </div>
                    </div>
                    <div id="preview">
                        <PreviewSign sign={this.state.sign} id={this.state.id} />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="app-root">
                    <SignSelector selectedId={null} onOpen={(id: number | null) => this.open(id)} />
                </div>
            )
        }
    }
}