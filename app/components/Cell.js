import React, { Component, PropTypes } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableHighlight,
  Platform,
} from 'react-native';

const styles = StyleSheet.create({
  icon: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
  cell: {
    width: 36,
    height: 36,
    margin: 1,
  },
});

export default class Cell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: this.props.count,
      pressSpring: new Animated.Value(1),
      x: this.props.col,
      y: this.props.row,
      isPoop: false,
      isFlag: false,
      isHidden: true,
    };
  }

  onPress() {
    if (this.props.getStatus() !== 'loser') {
      this.state.pressSpring.setValue(1.2);
      Animated.spring(this.state.pressSpring, { toValue: 1 }).start();
      if (this.state.isHidden && !this.state.isFlag)
        this.props.revealCells(this.state.x, this.state.y);
    }
  }

  onLongPress() {
    if (this.state.isHidden)
      this.setState({ isFlag: !this.state.isFlag });
    this.state.pressSpring.setValue(1.1);
    Animated.spring(this.state.pressSpring, { toValue: 1 }).start();
  }

  render() {
    let display = '';
    if (this.state.isHidden) display = this.state.isFlag ? '⚑' : '';
    else display = this.state.isPoop ? '\uD83D\uDCA9' : (this.state.count || '');

    if (Platform.OS === 'android') {
      return (
        <TouchableNativeFeedback
          onPress={this.onPress.bind(this)}
          onLongPress={this.onLongPress.bind(this)}
        >
          <Animated.View style={[styles.cell, {
            backgroundColor: this.state.isHidden ? 'steelblue' : 'lightsteelblue',
            transform: [{ scale: this.state.pressSpring }],
          }]}
          >
            <Text style={styles.icon}>{display}</Text>
          </Animated.View>
        </TouchableNativeFeedback>
      );
    }

    return (
      <TouchableHighlight
        onPress={this.onPress.bind(this)}
        onLongPress={this.onLongPress.bind(this)}
      >
        <Animated.View style={[styles.cell, {
          backgroundColor: this.state.isHidden ? 'steelblue' : 'lightsteelblue',
          transform: [{ scale: this.state.pressSpring }],
        }]}
        >
          <Text style={styles.icon}>{display}</Text>
        </Animated.View>
      </TouchableHighlight>
    );
  }
}

Cell.propTypes = {
  revealCells: PropTypes.func.isRequired,
  count: PropTypes.number,
  col: PropTypes.number.isRequired,
  row: PropTypes.number.isRequired,
  getStatus: PropTypes.func.isRequired,
};

Cell.defaultProps = {
  count: 0,
};

