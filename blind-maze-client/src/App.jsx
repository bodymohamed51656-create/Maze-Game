import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import Maze from './components/Maze';
import RunnerPlayer from './Components/RunnerPlayer';
import RunnerHUD from  "./Components/Runner_HUD";
import PlayerModel from './Components/PlayerModel';

const socket = io('http://localhost:3001', {
  autoConnect: false 
});

function App() {
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState(null);
  const [gameState, setGameState] = useState('lobby'); 
  const [mazeData, setMazeData] = useState(null);
  const [runnerState, setRunnerState] = useState({ x: null, z: null, rotationY: 0, isMoving: false });

  useEffect(() => {
    socket.on('room_created', (data) => {
      setRoomId(data.roomId);
      setRole(data.role);
      setGameState('waiting');
    });

    socket.on('joined', (data) => {
      setRoomId(data.roomId);
      setRole(data.role);
      setGameState('waiting');
    });

    socket.on('game_start', (data) => {
      setMazeData(data.maze);
      setGameState('playing');
    });

    socket.on('player_moved', (data) => {
      setRunnerState({
        x: data.newPos.x,
        z: data.newPos.z,
        rotationY: data.rotationY || 0,
        isMoving: data.isMoving || false
      });
    });

    socket.on('room_error', (msg) => {
      alert(msg);
      socket.disconnect();
      setGameState('lobby');
    });

    return () => {
      socket.off('room_created');
      socket.off('joined');
      socket.off('game_start');
      socket.off('player_moved');
      socket.off('room_error');
    };
  }, []);

  const createRoom = () => {
    socket.connect();
    socket.emit('create_room');
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim() !== '') {
      socket.connect();
      socket.emit('join_room', roomId);
    }
  };

  // --- 1. Lobby Screen ---
  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-xl shadow-2xl p-8 border border-gray-800">
          <h1 className="text-4xl font-extrabold text-center mb-8 tracking-tight">
            BLIND <span className="text-indigo-500">MAZE</span>
          </h1>
          <button onClick={createRoom} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-6 shadow-lg shadow-indigo-500/30">
            Create New Game
          </button>
          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>
          <form onSubmit={joinRoom} className="space-y-4">
            <input type="text" placeholder="Enter Room Code" value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-500 text-center uppercase tracking-widest" required />
            <button type="submit" className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
              Join Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. Waiting Screen ---
  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center bg-gray-900 p-8 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-gray-300">Room Code</h2>
            <p className="text-5xl font-mono text-indigo-400 mb-6 tracking-widest">{roomId}</p>
            <p className="text-gray-400">Share this code with your friend.</p>
            <p className="mt-4 text-sm text-gray-500">You are: <span className="font-bold text-white">{role === 'Guide' ? 'The Guide' : 'The Runner'}</span></p>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. Playing Screen ---
  if (gameState === 'playing') {
    const cols = mazeData[0].length;
    const rows = mazeData.length;
    const startX = 1 - (cols / 2) + 0.5;
    const startZ = 1 - (rows / 2) + 0.5;

    return (
      <div className="min-h-screen bg-sky-200 text-white flex flex-col overflow-hidden relative">
        <main className="flex-1 relative cursor-crosshair w-full h-full">
          
          <div className="absolute inset-0 z-0">
           <Canvas shadows>
              {/* توسيع مدى الرؤية والضباب ليناسب المتاهة الكبيرة */}
              <color attach="background" args={['#87CEEB']} /> 
              <fog attach="fog" args={['#87CEEB', 25, 90]} /> 
              <ambientLight intensity={0.85} /> 
              <directionalLight 
                position={[30, 50, 25]} 
                intensity={1.6} 
                castShadow 
                shadow-camera-left={-35}
                shadow-camera-right={35}
                shadow-camera-top={35}
                shadow-camera-bottom={-35}
              />

              {/* رفع كاميرا المرشد لارتفاع 38 ليرى المتاهة الـ 31x31 بالكامل من أعلى */}
           {/* كاميرا المرشد + رسم شخصية العداء مع العلامة المضيئة فوقه */}
              {role === 'Guide' && (
                <>
                  <PerspectiveCamera makeDefault position={[0, 35, 10]} rotation={[-Math.PI / 2.3, 0, 0]} />
                  <OrbitControls enableRotate={true} enableZoom={true} />
                  <PlayerModel 
                    position={[
                      runnerState.x !== null ? runnerState.x : startX, 
                      -0.5, 
                      runnerState.z !== null ? runnerState.z : startZ
                    ]} 
                    rotationY={runnerState.rotationY} 
                    isMoving={runnerState.isMoving} 
                    showMarker={true} 
                  />
                </>
              )}

              {/* كاميرا وحركة العداء */}
              {role === 'Runner' && (
                <RunnerPlayer 
                  mazeData={mazeData} 
                  startX={startX} 
                  startZ={startZ} 
                  socket={socket} 
                  roomId={roomId} 
                />
              )}

              {/* رسم متاهة الغابة والأشجار */}
              <Maze mazeData={mazeData} />
            </Canvas>
          </div>

          {/* واجهة المستخدم (HUD) بدون أي طبقات مظلمة */}
          <RunnerHUD roomId={roomId} role={role} socket={socket} />
        </main>
      </div>
    );
  }

  return null;
}

export default App;