
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './Table.css';

const Table = ({ headers, data }) => {
  const tableRef = useRef();

  return (
    <div className="table-container">
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <group ref={tableRef}>
          {/* Create table headers */}
          {headers.map((header, index) => (
            <mesh key={index} position={[index * 4, 0, 0]}>
              <boxBufferGeometry args={[3, 0.5, 1]} />
              <meshStandardMaterial color="gray" />
              <text
                position={[0, 0, 0.6]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {header}
              </text>
            </mesh>
          ))}

          {/* Create table rows */}
          {data.map((row, rowIndex) => (
            <group key={rowIndex} position={[0, -(rowIndex + 1) * 1, 0]}>
              {Object.values(row).map((cell, cellIndex) => (
                <mesh key={cellIndex} position={[cellIndex * 4, 0, 0]}>
                  <boxBufferGeometry args={[3, 0.5, 1]} />
                  <meshStandardMaterial color="lightblue" />
                  <text
                    position={[0, 0, 0.6]}
                    fontSize={0.2}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {cell}
                  </text>
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </Canvas>
    </div>
  );
};

export default Table;
