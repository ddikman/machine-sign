import { createContext, useContext, useState, ReactNode } from 'react';
import * as Yaml from 'yaml';
import { SectionCleanup, SectionFreeText, SectionMaintenance, SectionMaterials, SectionOutOfOrder, SectionSafety, Sign } from '@/types';

interface SignContextType {
    signs: Sign[];
    loading: boolean;
    loadSigns: () => Promise<void>;
    getSignByName: (name: string) => Sign | undefined;
}

const SignContext = createContext<SignContextType | undefined>(undefined);

export function SignProvider({ children }: { children: ReactNode }) {
    const [signs, setSigns] = useState<Sign[]>([]);
    const [loading, setLoading] = useState(false);

    const loadSigns = async () => {
        // Only load if signs array is empty
        if (signs.length > 0) return;

        setLoading(true);
        try {
            const response = await fetch('/data.yaml');
            const yamlString = await response.text();
            const dataJson = Yaml.parse(yamlString);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSigns(dataJson.signs.map((sign: any) => {
                const typedSign = new Sign();
                Object.assign(typedSign, sign);
                typedSign.sections.allowedMaterials = Object.assign(new SectionMaterials(), sign.sections.allowedMaterials);
                typedSign.sections.prohibitedMaterials = Object.assign(new SectionMaterials(), sign.sections.prohibitedMaterials);
                typedSign.sections.safety = Object.assign(new SectionSafety(), sign.sections.safety);
                typedSign.sections.cleanup = Object.assign(new SectionCleanup(), sign.sections.cleanup);
                typedSign.sections.quickStart = Object.assign(new SectionFreeText(), sign.sections.quickStart);
                typedSign.sections.outOfOrder = Object.assign(new SectionOutOfOrder(), sign.sections.outOfOrder);
                typedSign.sections.maintenance = Object.assign(new SectionMaintenance(), sign.sections.maintenance);
                return typedSign;
            }));
        } catch (error) {
            console.error('Error reading signs:', error);
            setSigns([]);
        } finally {
            setLoading(false);
        }
    };

    const getSignByName = (name: string) => {
        return signs.find(sign => sign.name === name);
    };

    return (
        <SignContext.Provider value={{ signs, loading, loadSigns, getSignByName }}>
            {children}
        </SignContext.Provider>
    );
}

export function useSignStore() {
    const context = useContext(SignContext);
    if (context === undefined) {
        throw new Error('useSignStore must be used within a SignProvider');
    }
    return context;
}