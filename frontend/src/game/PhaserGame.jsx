import React, { useEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';
import { useGameStore } from '../stores/useGameStore';

export const PhaserGame = () => {
    const gameRef = useRef(null);
    const gameBible = useGameStore(state => state.gameBible);

    useEffect(() => {
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
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [gameBible]);

    return <div id="game-container" />;
};
