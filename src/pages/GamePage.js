import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import QRCode from "react-qr-code";
import ActionsInfo from '../components/ActionsInfo';
import BoardComponent from '../components/BoardComponent';
import { Board } from '../models/Board';

const wss = new WebSocket('ws://localhost:4000')

const GamePage = () => {
    const [myBoard, setMyBoard] = useState(new Board());
    const [hisBoard, setHisBoard] = useState(new Board());
    const [rivalName, setRivalName] = useState('')
    const [shipsReady, setShipReady] = useState(false);
    const [canShoot, setCanShoot] = useState(false);
    const { gameId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const nickname = searchParams.get('nickname');
    const playersCount = searchParams.get('playersCount');
    const [guestLink, setGuestLink] = useState(`http://192.168.0.100:3000/chat/${gameId}?playersCount=${playersCount}&nickname=player_2`);
    const navigate = useNavigate()

    wss.onmessage = function (response) {
        const { type, payload } = JSON.parse(response.data)
        const { username, x, y, canStart, rivalName, success } = payload
        switch (type) {
            case 'connectToPlay':
                if (!success) {
                    return navigate('/')
                }
                setRivalName(rivalName)
                break;
            case 'readyToPlay':
                if (payload.username === nickname && canStart) {
                    setCanShoot(true)
                }
                break;
            case 'afterShootByMe':
                if (username !== nickname) {
                    const isPerfectHit = myBoard.cells[y][x].mark?.name === 'ship'
                    changeBoardAfterShoot(myBoard, setMyBoard, x, y, isPerfectHit)
                    wss.send(JSON.stringify({ event: 'checkShoot', payload: { ...payload, isPerfectHit } }))
                    if (!isPerfectHit) {
                        setCanShoot(true)
                    }
                }
                break;
            case 'isPerfectHit':
                if (username === nickname) {
                    changeBoardAfterShoot(hisBoard, setHisBoard, x, y, payload.isPerfectHit);
                    payload.isPerfectHit ? setCanShoot(true) : setCanShoot(false)
                }
                break;
            default:
                break;
        }
    }

    function changeBoardAfterShoot(board, setBoard, x, y, isPerfectHit) {
        isPerfectHit ? board.addDamage(x, y) : board.addMiss(x, y)
        const newBoard = board.getCopyBoard()
        setBoard(newBoard)
    }

    function restart() {
        const newMyBoard = new Board()
        const newHisBoard = new Board()
        newMyBoard.initCells();
        newHisBoard.initCells();
        setMyBoard(newMyBoard);
        setHisBoard(newHisBoard)
    }

    function ready() {
        wss.send(JSON.stringify({ event: 'ready', payload: { username: nickname, gameId } }))
        setShipReady(true)
    }

    function shoot(x, y) {
        wss.send(JSON.stringify({ event: 'shoot', payload: { username: nickname, x, y, gameId } }))
    }

    useEffect(() => {
        setTimeout(() => {
            wss.send(JSON.stringify({ event: 'connect', payload: { username: nickname, gameId } }));
            restart();
        }, 300);
    }, [gameId]);

    console.log(canShoot);

    return (
        <div>
            <img alt="idi na hui" width="100" src="/hero.jpeg" />
            <div>
                <QRCode value={guestLink} />
            </div>
        
            <div>
                <a href={guestLink}>{guestLink}</a>
            </div>
            
            <div className='boards-container'>
                <div>
                    <p className='nick'>{nickname}</p>
                </div>
                <div>
                    <p className='nick'>{rivalName || 'Ваш соперник пока не вошел.'}</p>
                </div>
            </div>
            <button onClick={ready}>Ready</button>
        </div>
    );
}

export default GamePage;
