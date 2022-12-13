import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const wss = new WebSocket('ws://localhost:4000')

function Login() {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('player_1');
    const [playersCount, setPlayersCount] = useState('1');

    const startPlay = (e) => {
        e.preventDefault();
        if (nickname) {
            const link = `/chat/${Date.now()}?playersCount=${playersCount}&nickname=${nickname}`;
            navigate(link);
        }
    };

    useEffect(() => {
        wss.close();
    }, []);

    return (
        <div>
            <img alt="idi na hui" width="100" src="/hero.jpeg" />
            <h2>Snark Game</h2>
            <form onSubmit={startPlay}>
                <div className="field-group">

                    <div><label htmlFor="nickname">Your nickname</label></div>
                    <input
                        type="text"
                        name="nickname"
                        value={nickname}
                        id="nickname"
                        onChange={e => setNickname(e.target.value)} 
                    />
                </div>

                <fieldset>
                    <legend>How many players?</legend>

                    <div>
                        <input 
                            type="radio" 
                            id="huey" 
                            name="playersCount" 
                            value="1" 
                            checked={playersCount === "1"}
                            onChange={(event) => setPlayersCount(event.target.value)}
                        />
                        <label htmlFor="huey">1</label>
                    </div>

                    <div>
                        <input 
                            type="radio" 
                            id="dewey" 
                            name="playersCount" 
                            value="2" 
                            checked={playersCount === "2"}
                            onChange={(event) => setPlayersCount(event.target.value)}
                        />
                        <label htmlFor="dewey">2</label>
                    </div>

                    <div>
                        <input 
                            type="radio" 
                            id="louie" 
                            name="playersCount" 
                            value="3" 
                            checked={playersCount === "3"}
                            onChange={(event) => setPlayersCount(event.target.value)}
                        />
                        <label htmlFor="louie">3</label>
                    </div>
                </fieldset>

                <button type="submit" className="btn-ready">Play Now</button>
            </form>
        </div>
    );
}

export default Login;