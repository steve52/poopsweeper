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
        onPress={this.props.onPress}
        onLongPress={this.props.onLongPress}
        cells={this.props.cells}
        cell={this.props.cells[this.props.row][i]}
      />);
  }

  setColState(col, state, callback) {
    this.refs[`cell-${col}`].setState(state, callback);
  }

  getColState(col) {
    return this.refs[`cell-${col}`].state;
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
  size: PropTypes.number.isRequired,
  row: PropTypes.number.isRequired,
  cells: PropTypes.arrayOf(PropTypes.array).isRequired,
  onPress: PropTypes.func.isRequired,
  onLongPress: PropTypes.func.isRequired,
};
