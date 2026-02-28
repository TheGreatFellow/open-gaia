import React, { useEffect, useRef, useState } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';
import { useGameStore } from '../stores/useGameStore';

export const PhaserGame = () => {
    const gameRef = useRef(null);
    const gameBible = useGameStore(state => state.gameBible);

    useEffect(() => {
        const onBootReady = () => setReady(true);
        EventBus.on('boot-complete', onBootReady);

        if (!gameRef.current) {
            gameRef.current = StartGame('game-container');
        }

        if (gameRef.current && gameBible) {
            console.log("PhaserGame injecting gameBible into registry:", {
                hasLocations: !!gameBible.locations,
                keys: Object.keys(gameBible),
                locations: gameBible.locations
            });
            gameRef.current.registry.set('gameBible', gameBible);
            EventBus.emit('bible-updated', gameBible);
        }

        return () => {
            clearTimeout(fallback);
            EventBus.off('boot-complete', onBootReady);
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
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
                    {/* Inline keyframes for the spinner */}
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
