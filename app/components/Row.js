import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import Cell from './Cell';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
});

export default class Row extends Component {
  constructor(props) {
    super(props);
    this.cells = [];
    for (let i = 0; i < this.props.size; i++)
      this.cells.push(<Cell
        key={i}
        ref={`cell-${i}`}
        row={this.props.row}
        col={i}
        revealCells={this.props.revealCells}
        getStatus={this.props.getStatus}
      />);
  }

  setColState(col, state, callback) {
    this.refs[`cell-${col}`].setState(state, callback);
  }

  getColState(col) {
    return this.refs[`cell-${col}`].state;
  }

  getHiddenTotal() {
    let sum = 0;
    for (let i = 0; i < this.props.size; i++)
      sum += this.getColState(i).isHidden | 0;
    return sum;
  }

  render() {
    return (
      <View style={styles.row} >
        {this.cells}
      </View>
    );
  }
}

Row.propTypes = {
  revealCells: PropTypes.func.isRequired,
  size: PropTypes.number.isRequired,
  row: PropTypes.number.isRequired,
  getStatus: PropTypes.func.isRequired,
};
