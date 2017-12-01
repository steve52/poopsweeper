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
  onPress = () => {
    this.props.onPress(this.props.row, this.props.col);
  }

  onLongPress = () => {
    this.props.onLongPress(this.props.row, this.props.col);
  }

  render() {
    let display = '';
    // if (this.props.isHidden) display = this.props.isFlag ? '⚑' : '';
    display = this.props.isPoop ? '\uD83D\uDCA9' : (this.props.count || '');

    if (Platform.OS === 'android') {
      return (
        <TouchableNativeFeedback
          onPress={this.onPress}
          onLongPress={this.onLongPress}
        >
          <Animated.View style={[styles.cell, {
            backgroundColor: this.props.isHidden ? 'steelblue' : 'lightsteelblue',
          }]}
          >
            <Text style={styles.icon}>{display}</Text>
          </Animated.View>
        </TouchableNativeFeedback>
      );
    }

    return (
      <TouchableHighlight
        onPress={this.onPress}
        onLongPress={this.onLongPress}
      >
        <Animated.View style={[styles.cell, {
          backgroundColor: this.props.isHidden ? 'steelblue' : 'lightsteelblue',
        }]}
        >
          <Text style={styles.icon}>{display}</Text>
        </Animated.View>
      </TouchableHighlight>
    );
  }
}

Cell.propTypes = {
  col: PropTypes.number.isRequired,
  row: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  isHidden: PropTypes.bool.isRequired,
  isFlag: PropTypes.bool.isRequired,
  isPoop: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
  onLongPress: PropTypes.func.isRequired,
};

