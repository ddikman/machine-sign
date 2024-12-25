import React, { Component } from 'react';

interface SignMeta {
    id: number;
    name: string;
    model: string;
}

interface SignSelectorProps {
    selectedId: number | null;
    onOpen: (id: number | null) => void;
}

function SignItem({ item, onOpen }: { item: SignMeta, onOpen: () => void }) {
    return (
        <li onClick={onOpen}>
            <span>{item.name}</span>{ }
            <span className='selector-machine-model'>{item.model}</span>
        </li>
    );
}

export class SignSelector extends Component<SignSelectorProps, { signs: SignMeta[] }> {
    constructor(props: SignSelectorProps) {
        super(props);
        this.state = { signs: [] };
    }

    componentDidMount() {
        this.findSigns();
    }

    async findSigns() {
        try {
            const response = await fetch("data/signs");
            if (!response.ok) throw new Error("Error " + response.status);
            const json = await response.json();
            this.setState({ signs: json.data });
        } catch (error) {
            console.error('Failed to load signs:', error);
        }
    }

    render() {
        const sortedSigns = [...this.state.signs].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        return (
            <div className="sign-selector">
                <h1>MakerSign</h1>
                <ul>
                    <li onClick={() => this.props.onOpen(null)}>
                        <span>Create new sign</span>
                    </li>
                </ul>
                <ul>
                    {sortedSigns.map(item =>
                        <SignItem
                            key={item.id}
                            item={item}
                            onOpen={() => this.props.onOpen(item.id)}
                        />
                    )}
                </ul>
            </div>
        );
    }
}

export class SignSelectorSmall extends SignSelector {
    componentDidUpdate(prevProps: SignSelectorProps) {
        if (prevProps.selectedId !== this.props.selectedId) {
            this.findSigns();
        }
    }

    render() {
        const sortedSigns = [...this.state.signs].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        return (
            <select
                className="sign-selector"
                value={this.props.selectedId != null ? this.props.selectedId : -1}
                onChange={e => {
                    const id = Number(e.target.value);
                    this.props.onOpen(id !== -1 ? id : null);
                }}
            >
                {sortedSigns.map(item => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
                <option value={-1}>Create new sign</option>
            </select>
        );
    }
}