import { useEffect, useRef, useState } from 'react';
import * as toxicity from '@tensorflow-models/toxicity';

import './App.css';

type Prediction = {
    label: string;
    match: boolean;
    probabilities: number[];
    probability: string;
};

type ToxicityProps = {
    predictions: Prediction[] | null;
};

function useTextToxicity(text: string, { threshold = 0.9, delay = 300 } = {}) {
    const [predictions, setPredictions] = useState<Prediction[] | null>(null);
    const model = useRef() as any;

    async function predict() {
        if (!text) return;
        model.current = model.current || (await toxicity.load(threshold, [
            'identity_attack', 'insult', 'threat', 'sexual_explicit',
            'toxicity', 'severe_toxicity', 'obscene'
        ]));
        const result = await model.current.classify([text]).catch(() => { });

        if (!result) return;

        setPredictions(
            result.map((prediction: any) => {
                const [{ match, probabilities }] = prediction.results;
                return {
                    label: prediction.label,
                    match,
                    probabilities,
                    probability: (probabilities[1] * 100).toFixed(2) + '%',
                };
            })
        );
    }

    useEffect(() => {
        const timeout = setTimeout(predict, delay);
        return () => clearTimeout(timeout);
    }, [text, delay]);

    return predictions;
}

function Toxicity({ predictions }: ToxicityProps) {
    if (!predictions) return <div className='mt-4 text-slate-500 italic'>Loading predictions...</div>

    return (
        <div className='mt-6 border rounded-md'>
            <h2 className='text-center w-full py-2 bg-slate-200 border-b font-medium text-slate-800'>Text Toxicity Analysis</h2>
            <div className='w-full bg-slate-100 p-4 text-slate-700 flex flex-col gap-2'>
                {predictions.map(({ label, match, probability }) => (
                    <div key={label}>
                        {`${label} - ${probability} - ${match ? '🤢' : '🥰'}`}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ToxicComponent() {
    const [value, setValue] = useState('');
    const predictions = useTextToxicity(value);

    return (
        <section className='mt-8 md:mt-32 mx-auto max-w-7xl p-4 w-full flex flex-col items-center justify-between'>
            <div className='w-full md:w-1/2'>
                <div>
                    <h1 className='text-lg font-medium text-slate-800'>Write something ✍️</h1>
                    <textarea
                        className='flex h-36 w-full rounded-md border bg-slate-50 border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:outline-slate-200 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 transition-all'
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>
                {value && <Toxicity predictions={predictions} />}
            </div>
            <footer className='mt-8 text-sm text-slate-500'>
                © 2024, imvinojanv
            </footer>
        </section>
    )
}

function App() {
    return (
        <>
        <ToxicComponent />
        </>
    )
}

export default App
