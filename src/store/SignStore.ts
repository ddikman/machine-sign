import { create } from 'zustand';
import * as Yaml from 'yaml';
import { Sign } from '@/types';

interface SignState {
    signs: Sign[];
    loading: boolean;
    loadSigns: () => Promise<void>;
    getSignByName: (name: string) => Sign | undefined;
}

export const useSignStore = create<SignState>((set, get) => ({
    signs: [],
    loading: false,
    loadSigns: async () => {
        // Only load if signs array is empty
        if (get().signs.length > 0) return;

        set({ loading: true });
        try {
            const response = await fetch(import.meta.env.BASE_URL + 'data.yaml');
            const yamlString = await response.text();
            const dataJson = Yaml.parse(yamlString);
            set({ signs: dataJson.signs as Sign[], loading: false });
        } catch (error) {
            console.error('Error reading signs:', error);
            set({ signs: [], loading: false });
        }
    },
    getSignByName: (name: string) => {
        return get().signs.find(sign => sign.name === name);
    }
}));