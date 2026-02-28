import React, { useEffect, useRef, useState } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';
import { useGameStore } from '../stores/useGameStore';

export const PhaserGame = () => {
    const gameRef = useRef(null);
    const [ready, setReady] = useState(false);
    const gameBible = useGameStore(state => state.gameBible);

    // Create game once on mount
    useEffect(() => {
        if (!gameRef.current) {
            gameRef.current = StartGame('game-container');
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    // Listen for boot-complete to show canvas
    useEffect(() => {
        const onBootReady = () => setReady(true);
        EventBus.on('boot-complete', onBootReady);

        // Safety fallback — show canvas after 6s no matter what
        const fallback = setTimeout(() => setReady(true), 6000);

        return () => {
            clearTimeout(fallback);
            EventBus.off('boot-complete', onBootReady);
        };
    }, []);

    // Inject gameBible into Phaser registry when it changes
    useEffect(() => {
        if (gameRef.current && gameBible) {
            console.log("PhaserGame injecting gameBible into registry:", {
                hasLocations: !!gameBible.locations,
                keys: Object.keys(gameBible),
            });
            gameRef.current.registry.set('gameBible', gameBible);
            EventBus.emit('bible-updated', gameBible);
        }
    }, [gameBible]);

    return (
        <div style={{ position: 'relative', width: '800px', height: '600px' }}>
            {/* React loading overlay — shown UNTIL Phaser is ready */}
            {!ready && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 10,
                    background: '#0a0a1a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    borderRadius: '8px',
                }}>
                    {/* Spinning ring */}
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #1a2a44',
                        borderTop: '3px solid #44aaff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                    <span style={{
                        color: '#44aaff',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                    }}>
                        LOADING WORLD...
                    </span>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            {/* Phaser canvas — hidden until ready, then fades in */}
            <div
                id="game-container"
                style={{
                    opacity: ready ? 1 : 0,
                    transition: 'opacity 0.4s ease-in',
                    width: '100%',
                    height: '100%',
                }}
            />
        </div>
    );
};
