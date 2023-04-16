import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';

import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid(0, 0);
    this.setState({ grid });
  }

  handleMouseDown(row, col) {
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }
  

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const { grid } = this.state;
  
    // Find start and finish nodes in the grid
    let startNode, finishNode;
    for (const row of grid) {
      for (const node of row) {
        if (node.isStart) {
          startNode = node;
        }
        if (node.isFinish) {
          finishNode = node;
        }
        if (startNode && finishNode) {
          break;
        }
      }
    }
  
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }
  

  getClosestGreenNode(grid, redNode) {
    let minDistance = Infinity;
    let closestGreenNode = null;

    grid.forEach((row) => {
      row.forEach((node) => {
        if (node.isGreen) {
          const distance = Math.abs(node.row - redNode.row) + Math.abs(node.col - redNode.col);
          if (distance < minDistance) {
            minDistance = distance;
            closestGreenNode = node;
          }
        }
      });
    });

    return closestGreenNode;
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const greenNodesCount = parseInt(e.target.greenNodes.value);
    const redNodesCount = parseInt(e.target.redNodes.value);
  
    const grid = getInitialGrid(greenNodesCount, redNodesCount);
    this.setState({ grid });
  
    const redNode = grid.find((row) => row.some((node) => node.isRed)).find((node) => node.isRed);
    const closestGreenNode = this.getClosestGreenNode(grid, redNode);
  
    // Clear original start and finish nodes
    grid[START_NODE_ROW][START_NODE_COL].isStart = false;
    grid[FINISH_NODE_ROW][FINISH_NODE_COL].isFinish = false;
  
    // Set new start and finish nodes
    closestGreenNode.isStart = true;
    redNode.isFinish = true;
  
    // Update grid state
    this.setState({ grid });
  }
  

  render() {
    const { grid, mouseIsPressed } = this.state;
  
    return (
      <>
      <h1>Create Your Network of DERs</h1>
        <form onSubmit={(e) => this.handleFormSubmit(e)} className="form-container">
          <label>
            Prosumers: 
            <input type="number" min="1" name="greenNodes" />
          </label>
          <label>
            Consumers:
            <input type="number" min="1" name="redNodes" />
          </label>
          <button type="submit" className="create-network-button">Create Network</button>

<button type="button" onClick={() => this.visualizeDijkstra()}>
    Visualize Shortest Path for Energy Transfer
  </button>
        </form>
       
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall, isGreen, isRed } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      isGreen={isGreen}
                      isRed={isRed}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}  

const getInitialGrid = (greenNodesCount, redNodesCount) => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }

  // Randomly create green and red nodes based on user input
  const createRandomNodes = (count, type) => {
    while (count > 0) {
      const row = Math.floor(Math.random() * 20);
      const col = Math.floor(Math.random() * 50);
      if (
        !grid[row][col].isStart &&
        !grid[row][col].isFinish &&
        !grid[row][col].isGreen &&
        !grid[row][col].isRed
      ) {
        grid[row][col][type] = true;
        count--;
      }
    }
  };
  

  createRandomNodes(greenNodesCount, "isGreen");
  createRandomNodes(redNodesCount, "isRed");

  return grid;
};
  
const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: false,/*row === START_NODE_ROW && col === START_NODE_COL, */
    isFinish: false,/*row === FINISH_NODE_ROW && col === FINISH_NODE_COL,*/
    isGreen: false,
    isRed: false,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};


const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};