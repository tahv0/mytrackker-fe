import React from 'react';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import { observer, inject } from 'mobx-react';
import { Constants, MapView, Location, Permissions, Icon } from 'expo';
import { Overlay, ListItem } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale

const dog = require('../assets/images/dog.png');
const paw = require('../assets/images/paw.png');

const { Marker } = MapView;

@inject('deviceStore')
@observer
class MapScreen extends React.Component {
  constructor(props) {
    super(props);
    this.onPressCurrentDevice = this.onPressCurrentDevice.bind(this);
    this.changeRegion = this.changeRegion.bind(this);
    this.state = {
      mapRegion: null,
      overLayVisible: false,
      hasLocationPermissions: false,
      locationResult: null,
      lastLocationId: null,
    };
  }

  componentDidMount() {
    this._getLocationAsync();
  }

  componentDidUpdate() {
    const { currentDevice } = this.props.deviceStore;
    if (!currentDevice) return;
    const locationItems = currentDevice.positionCollection.items;
    if (!currentDevice || isEmpty(locationItems)) return;

    const { lastLocationId } = this.state;

    if (!lastLocationId || lastLocationId !== locationItems[0].id) {
      this.setState(
        {
          lastLocationId: locationItems[0].id,
        },
        this.changeRegion
      );
    }
  }

  onPressCurrentDevice(device) {
    this.props.deviceStore.setCurrentDevice(device);
    this.changeRegion();
    this.setState({
      overLayVisible: false,
    });
  }

  changeRegion() {
    const { currentDevice } = this.props.deviceStore;
    const locationItems = currentDevice.positionCollection.items;
    const locationItemsEmpty = isEmpty(locationItems);
    let latitude = (longitude = lastLocationId = null);
    const { mapRegion } = this.state;

    if (locationItemsEmpty) {
      latitude = mapRegion.latitude;
      longitude = mapRegion.longitude;
    } else {
      latitude = locationItems[0].latitude;
      longitude = locationItems[0].longitude;
      lastLocationId = locationItems[0].id;
    }
    if (
      mapRegion &&
      (mapRegion.latitude !== latitude || mapRegion.longitude !== longitude)
    ) {
      this.setState({
        mapRegion: {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        lastLocationId,
      });
    }
  }

  onPressRefreshDevice() {
    const { currentDevice } = this.props.deviceStore;
    currentDevice.positionCollection.fetchPositions();
  }

  _setOverlayVisibility = () => {
    this.setState({
      overLayVisible: !this.state.overLayVisible,
    });
  };
  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });
    } else {
      this.setState({ hasLocationPermissions: true });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ locationResult: JSON.stringify(location) });
    // Center the map on the location we just fetched.
    this.setState({
      mapRegion: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
    });
  };

  static navigationOptions = {
    header: null,
  };

  renderRefreshButton() {
    const { currentDevice } = this.props.deviceStore;

    if (currentDevice.positionCollection.isLoading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
      <Icon.Ionicons
        name="md-refresh"
        raised
        size={50}
        onPress={this.onPressRefreshDevice.bind(this)}
      />
    );
  }

  renderDeviceListItem(item) {
    const { currentDevice } = this.props.deviceStore;
    const selectedItem =
      currentDevice && currentDevice.deviceId === item.deviceId;
    return (
      <ListItem
        component={TouchableScale}
        friction={90} //
        tension={100} // These props are passed to the parent component (here TouchableScale)
        activeScale={0.95} //
        linearGradientProps={{
          colors: selectedItem
            ? ['#2e8b57', '#3cb371']
            : ['#F44336', '#FF9800'],
          start: [1, 0],
          end: [0.2, 0],
        }}
        key={item.deviceId}
        title={item.name}
        titleStyle={{ color: 'white', fontWeight: 'bold' }}
        chevronColor="white"
        chevron
        onPress={() => this.onPressCurrentDevice(item)}
      />
    );
  }

  _keyExtractor = (item, index) => index.toString();

  renderDeviceListItems = () => {
    const { devices } = this.props.deviceStore;

    return (
      <View>
        {devices.map(device => {
          return this.renderDeviceListItem(device);
        })}
      </View>
    );
  };

  render() {
    const { currentDevice } = this.props.deviceStore;
    return (
      <View style={styles.container}>
        <Overlay
          style={{ zIndex: 2, position: 'absolute' }}
          isVisible={this.state.overLayVisible}
          onBackdropPress={this._setOverlayVisibility}
        >
          <Text>Select Device</Text>
          {this.renderDeviceListItems()}
        </Overlay>
        {this.state.locationResult === null ? (
          <Text>Finding your current location...</Text>
        ) : this.state.hasLocationPermissions === false ? (
          <Text>Location permissions are not granted.</Text>
        ) : this.state.mapRegion === null ? (
          <Text>Map region doesn't exist.</Text>
        ) : (
          <View style={styles.mapContainer}>
            <View style={styles.settingsIcon}>
              <Icon.Ionicons
                name="md-settings"
                raised
                size={50}
                onPress={this._setOverlayVisibility}
              />
              {currentDevice && this.renderRefreshButton()}
            </View>
            <MapView
              style={{ alignSelf: 'stretch', flex: 1, marginBottom: 1 }}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsBuildings={true}
              showsPointsOfInterest={true}
              region={this.state.mapRegion}
              onRegionChangeComplete={this._handleMapRegionChange}
            >
              {currentDevice &&
                currentDevice.positionCollection.items.map((pos, i) => (
                  <Marker
                    key={i}
                    title={moment(pos.serverTime).toLocaleString()}
                    coordinate={{
                      longitude: pos.longitude,
                      latitude: pos.latitude,
                    }}
                  >
                    <Image
                      source={i > 0 ? paw : dog}
                      style={{
                        width: i > 0 ? 30 : 51,
                        height: i > 0 ? 30 : 51,
                        resizeMode: 'contain',
                        zIndex: i > 0 ? 3 : 4,
                      }}
                    />
                  </Marker>
                ))}
            </MapView>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mapContainer: {
    alignSelf: 'stretch',
    zIndex: 1,
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  settingsIcon: {
    position: 'absolute',
    zIndex: 2,
    alignSelf: 'flex-end',
    bottom: 20,
    paddingRight: 10,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});

export default MapScreen;
