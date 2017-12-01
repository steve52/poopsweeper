import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import _ from 'lodash';

import Cell from './Cell';

const styles = StyleSheet.create({
  table: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
});

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.rows = [];
    this.poops = []; // local poop cache

    const cells = [];

    for (let y = 0; y < this.props.size; y++) {
      cells[y] = [];
      for (let x = 0; x < this.props.size; x++) {
        cells[y][x] = {
          isFlag: false,
          isHidden: true,
          isPoop: false,
          count: 0,
          x,
          y,
        };
      }
    }

    this.state = {
      cells,
    };
  }

  componentDidMount() {
    this.setupPoops(this.props.totalPoops);
    // this.setupClues();
  }

  onPress = (row, col) => {
    const thisCell = this.state.cells[row][col];
    if (this.props.getStatus() !== 'loser') {
      if (thisCell.isHidden && !thisCell.isFlag)
        this.revealCells(col, row);
    }
  }

  onLongPress = (row, col) => {
    const thisCell = this.state.cells[row][col];
    if (thisCell.isHidden) {
      this.setCellState(col, row, { isFlag: !this.state.isFlag });
    }
  }

  recursivelyPlacePoops(cells, numPoops) {
    const newCells = _.cloneDeep(cells);
    if (numPoops) {
      const sizeSq = this.props.size * this.props.size;
      const index = (Math.random() * sizeSq) | 0;
      const row = index / this.props.size | 0;
      const col = index % this.props.size;
      const cell = cells[row][col];
      if (!cell.isPoop) {
        this.setCellState(col, row, { isPoop: true });
        newCells[col][row].isPoop = true;
        this.poops.push({ x: col, y: row });
        return this.recursivelyPlacePoops(newCells, numPoops - 1);
      } else {
        return this.recursivelyPlacePoops(newCells, numPoops);
      }
    } else {
      return cells;
    }
  }

  setupPoops(total) {
    // const newCells = this.recursivelyPlacePoops(this.state.cells, total);
    this.poops.push({ x: 1, y: 0 });
    this.setCellState(0, 1, { isPoop: true });
    this.setupClues();
    // this.setState({ cells: newCells }, this.setupClues);
  }

  setupClues() {
    // const newCells = _.cloneDeep(this.state.cells);
    for (let i = 0; i < this.props.size; i++) {
      for (let j = 0; j < this.props.size; j++) {
        const count = this.getBorderPoop(j, i).length;
        this.setCellState(i, j, { count });
        // newCells[j][i].count = count;
      }
    }
    // this.setState({ cells: newCells });
  }

  getBorderPoop(x, y) {
    const ups = {
      upleft: this.poops.filter(p => p.x === x - 1 && p.y === y - 1),
      up: this.poops.filter(p => p.x === x && p.y === y - 1),
      upright: this.poops.filter(p => p.x === x + 1 && p.y === y - 1),
    };
    const downs = {
      downleft: this.poops.filter(p => p.x === x - 1 && p.y === y + 1),
      down: this.poops.filter(p => p.x === x && p.y === y + 1),
      downright: this.poops.filter(p => p.x === x + 1 && p.y === y + 1),
    };
    const sides = {
      left: this.poops.filter(p => p.x === x - 1 && p.y === y),
      right: this.poops.filter(p => p.x === x + 1 && p.y === y),
    };
    const states = [
      ups.upleft,
      ups.up,
      ups.upright,
      sides.left, sides.right,
      downs.downleft,
      downs.down,
      downs.downright,
    ]
      .filter(cell => !!cell.length)
      .map(cell => cell[0]);
    return states;
  }

  setCellState(col, row, state, callback) {
    this.setState((prevState) => {
      const newCells = _.cloneDeep(prevState.cells);
      const newState = Object.assign({}, prevState.cells[row][col], state);
      newCells[row][col] = newState;
      return { cells: newCells };
    }, callback);
  }

  getCellState(col, row) {
    if ((col < 0 || col >= this.props.size || row < 0 || row >= this.props.size)
      || Number.isNaN(col)
      || Number.isNaN(row))
      return null;
    return this.state.cells[row][col];
  }

  getHiddenTotal() {
    let sum = 0;
    for (let i = 0; i < this.props.size; i++) {
      for (let j = 0; j < this.props.size; j++) {
        sum += this.getCellState(i, j).isHidden | 0;
      }
    }
    return sum;
  }

  // getBorderCells(x, y) {
  //   return [
  //     this.getCellState(x - 1, y - 1),
  //     this.getCellState(x, y - 1),
  //     this.getCellState(x + 1, y - 1),
  //     this.getCellState(x - 1, y),
  //     this.getCellState(x + 1, y),
  //     this.getCellState(x - 1, y + 1),
  //     this.getCellState(x, y + 1),
  //     this.getCellState(x + 1, y + 1),
  //   ].filter(c => c !== null && c.isHidden);
  // }

  // revealCell = (x, y) => {
  //   const cell = this.getCellState(x, y);
  //   if (cell.isPoop) {
  //     this.props.setStatus('loser');
  //   } else if (!cell.isFlag && cell.isHidden) {
  //     this.setCellState(x, y, { isHidden: false }, () => {
  //       if (!cell.count) {
  //         const borderCells = this.getBorderCells(x, y);
  //         borderCells.forEach((c) => {
  //           this.revealCell(c.x, c.y);
  //         });
  //       }
  //     });
  //   }
  // }


  revealCells = (_x, _y) => {
    const loop = (x, y) => {
      const cell = this.getCellState(x, y);
      const borderCells = [
        this.getCellState(x - 1, y - 1),
        this.getCellState(x, y - 1),
        this.getCellState(x + 1, y - 1),
        this.getCellState(x - 1, y),
        this.getCellState(x + 1, y),
        this.getCellState(x - 1, y + 1),
        this.getCellState(x, y + 1),
        this.getCellState(x + 1, y + 1),
      ].filter(c => c !== null && !this.renderQueue.filter(p => p.x === c.x && p.y === c.y).length);

      if (!cell.isFlag && cell.isHidden) {
        console.log('add to renderQueue', x, y);
        this.renderQueue.push({ x, y });
        if (cell.isPoop) {
          this.renderQueue = [{ x, y }];
          this.props.setStatus('loser');
          return;
        }
        if (!cell.count)
          borderCells.forEach((c) => {
            loop(c.x, c.y);
          });
      }
    };

    this.renderQueue = [];
    this.props.setStatus('nervous');
    loop(_x, _y);
    console.log('renderQueue', this.renderQueue);

    this.renderQueue.forEach((c) => {
      this.setCellState(c.x, c.y, { isHidden: false }, () => {
        if (this.props.getStatus() !== 'loser') {
          const hiddenTotal = this.getHiddenTotal();
          if (hiddenTotal === this.props.totalPoops) {
            this.revealAll();
            setTimeout(() => this.props.setStatus('winner'), 250);
          } else setTimeout(() => this.props.setStatus('player'), 200);
        }
      });
    });
  }

  revealAll() {
    for (let i = 0; i < this.props.size; i++)
      for (let j = 0; j < this.props.size; j++)
        this.setCellState(j, i, { isHidden: false, isFlag: false });
  }

  render() {
    const rowViews = [];
    for (let i = 0; i < this.props.size; i++) {
      const cellViews = [];
      for (let j = 0; j < this.props.size; j++) {
        // console.log('this.state.cells', this.state.cells[i][j])
        cellViews.push(<Cell
          key={j}
          row={i}
          col={j}
          count={this.state.cells[i][j].count}
          isPoop={this.state.cells[i][j].isPoop}
          isHidden={this.state.cells[i][j].isHidden}
          isFlag={this.state.cells[i][j].isFlag}
          onPress={this.onPress}
          onLongPress={this.onLongPress}
        />);
      }
      rowViews.push(<View style={styles.row} key={i}>{cellViews}</View>);
    }
    return <View style={styles.table}>{rowViews}</View>;
  }
}

Table.propTypes = {
  size: PropTypes.number.isRequired,
  totalPoops: PropTypes.number.isRequired,
  getStatus: PropTypes.func.isRequired,
  setStatus: PropTypes.func.isRequired,
};
