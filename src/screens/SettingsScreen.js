import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { observer, inject } from 'mobx-react';
import DeviceEditForm from '../components/DeviceEditForm';
import Device from '../models/Device';

@inject('deviceStore')
@observer
class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.onPressSave = this.onPressSave.bind(this);
    this.state = {
      newDevice: Device.create({
        deviceId: '',
        name: '',
      }),
    };
  }

  onPressSave(cloneDevice) {
    const deviceStore = this.props.deviceStore;
    const storeDevice = deviceStore.devices.find(
      device => device.id === cloneDevice.id
    );
    if (storeDevice) {
      storeDevice.editProperty('name', cloneDevice.name);
      storeDevice.editProperty('deviceId', cloneDevice.deviceId);
    } else {
      deviceStore.addDevice(cloneDevice);
      this.setState({
        newDevice: Device.create({
          deviceId: '',
          name: '',
        }),
      });
    }
  }

  static navigationOptions = {
    title: 'Settings',
  };

  render() {
    const { devices } = this.props.deviceStore;
    return (
      <ScrollView style={styles.container}>
        {devices.map((device, i) => (
          <DeviceEditForm
            index={i}
            isNew={false}
            key={device.deviceId}
            deviceItem={device}
            onPressSave={this.onPressSave}
          />
        ))}
        <DeviceEditForm
          isNew={true}
          deviceItem={this.state.newDevice}
          onPressSave={this.onPressSave}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
});

export default SettingsScreen;
