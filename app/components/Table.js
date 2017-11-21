import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import Row from './Row';

const styles = StyleSheet.create({
  table: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.rows = [];
    this.poops = []; // local poop cache
    for (let i = 0; i < this.props.size; i++)
      this.rows.push(<Row
        key={i}
        ref={`row-${i}`}
        size={this.props.size}
        row={i}
        revealCells={this.revealCells}
        getStatus={this.props.getStatus}
      />);
  }

  componentDidMount() {
    this.setupPoops(this.props.totalPoops);
    this.setupClues();
  }

  setupPoops(total) {
    if (total) {
      const sizeSq = this.props.size * this.props.size;
      const index = (Math.random() * sizeSq) | 0;
      const row = index / this.props.size | 0;
      const col = index % this.props.size;
      const cell = this.getCellState(col, row);
      if (!cell.isPoop) {
        this.setCellState(col, row, { isPoop: true });
        this.poops.push({ x: col, y: row });
        console.log(`poop @ ${col}, ${row}`);
        this.setupPoops(total - 1);
      } else this.setupPoops(total);
    }
  }

  setupClues() {
    for (let i = 0; i < this.props.size; i++) {
      for (let j = 0; j < this.props.size; j++) {
        const count = this.getBorderPoop(j, i).length;
        this.setCellState(j, i, { count });
      }
    }
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

  setCellState(x, y, state, callback) {
    this.refs[`row-${y}`].setColState(x, state, callback);
  }

  getCellState(x, y) {
    if ((x < 0 || x >= this.props.size || y < 0 || y >= this.props.size)
      || Number.isNaN(x)
      || Number.isNaN(y))
      return null;
    return this.refs[`row-${y}`].getColState(x);
  }

  getHiddenTotalByRow(row) {
    return this.refs[`row-${row}`].getHiddenTotal();
  }

  getHiddenTotal() {
    let sum = 0;
    for (let i = 0; i < this.props.size; i++)
      sum += this.refs[`row-${i}`].getHiddenTotal();
    return sum;
  }

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
        this.renderQueue.push({ x, y });
        if (cell.isPoop) {
          this.renderQueue = [{ x, y }];
          this.props.setStatus('loser');
          return;
        }
        if (!cell.count)
          borderCells.forEach(c => loop(c.x, c.y));
      }
    };

    this.renderQueue = [];
    this.props.setStatus('nervous');
    loop(_x, _y);
    this.renderQueue.forEach(p => this.setCellState(p.x, p.y, { isHidden: false }, () => {
      if (this.props.getStatus() !== 'loser') {
        const hiddenTotal = this.getHiddenTotal();
        if (hiddenTotal === this.props.totalPoops) {
          this.revealAll();
          setTimeout(() => this.props.setStatus('winner'), 250);
        } else setTimeout(() => this.props.setStatus('player'), 200);
      }
    }));
  }

  revealAll() {
    for (let i = 0; i < this.props.size; i++)
      for (let j = 0; j < this.props.size; j++)
        this.setCellState(j, i, { isHidden: false, isFlag: false });
  }

  render() {
    return <View style={styles.table}>{this.rows}</View>;
  }
}

Table.propTypes = {
  size: PropTypes.number.isRequired,
  totalPoops: PropTypes.number.isRequired,
  getStatus: PropTypes.func.isRequired,
  setStatus: PropTypes.func.isRequired,
};
