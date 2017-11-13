import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
} from 'react-native';

import Table from './Table';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#eee',
  },
  title: {
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 24,
  },
  text: {
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#bbb',
    fontSize: 14,
  },
  instructions: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#bbb',
    fontSize: 36,
  },
  statusBar: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#ddd',
  },
  reset: {
    backgroundColor: 'green',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class Poopsweeper extends Component {
  constructor() {
    super();
    this.state = {
      key: -1,
      status: 'player',
    };
    this.statusEnum = {
      player: '\uD83D\uDE42',
      winner: '😁',
      nervous: '😓',
      loser: '😭',
    };
  }

  setStatus = (status) => {
    this.setState({ status });
  }

  getStatus = () => {
    return this.state.status;
  }

  getStatusEmoji() {
    return this.statusEnum[this.state.status];
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.instructions}>
          <Text style={styles.title}>Poopsweeper</Text>
          <Text style={styles.text}>Press on a cell to reveal it and long press to flag it.</Text>
        </View>
        <ScrollView>
          <Table
            key={this.state.key}
            size={9}
            totalPoops={9}
            setStatus={this.setStatus}
            getStatus={this.getStatus}
          />
        </ScrollView>
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>{this.getStatusEmoji()}</Text>
        </View>
        <Button color="#999" style={styles.reset} onPress={() => this.setState({ key: Math.random() * 10, status: 'player' })} title="New Game" />
      </View>
    );
  }
}

