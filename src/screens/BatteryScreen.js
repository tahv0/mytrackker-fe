import React from 'react';
import moment from 'moment';
import { Dimensions, Text, View } from 'react-native';
import { isEmpty } from 'lodash';
import { observer, inject } from 'mobx-react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { Bar } from 'react-native-progress';

@inject('deviceStore')
@observer
class BatteryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  static navigationOptions = {
    title: 'Battery statuses',
  };

  _onRefresh = async () => {
    const { devices } = this.props.deviceStore;
    this.setState({ refreshing: true });

    try {
      for (let device of devices) {
        await device.batteryLevelCollection.fetchBatteryLevels();
      }
    } finally {
      this.setState({ refreshing: false });
    }
  };

  render() {
    const { devices } = this.props.deviceStore;
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }
      >
        {devices.map((device, i) => {
          const { items } = device.batteryLevelCollection;
          let deviceWidth = Dimensions.get('window').width - 50;
          let updatedAtText = 'Error - could not fetch battery status';
          const hasItems = !isEmpty(items);
          if (hasItems) {
            const item = items[0];
            const localeString = moment(item.serverTime).toLocaleString();
            updatedAtText = `Last updated ${localeString}`;
          }
          const progress = !hasItems ? 0 : items[0].batteryLevel / 100;
          return (
            <ListItem
              key={i}
              title={device.name}
              subtitle={
                <View>
                  <Text
                    style={{ alignSelf: 'flex-end' }}
                  >{`Battery level ${progress * 100} %`}</Text>
                  <Text>{updatedAtText}</Text>
                  <Bar progress={progress} width={deviceWidth} height={20} />
                </View>
              }
            />
          );
        })}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});

export default BatteryScreen;
