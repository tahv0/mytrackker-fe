import React from 'react';
import { observer, inject } from 'mobx-react';
import { clone } from 'mobx-state-tree';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import t from 'tcomb-form-native';

const Form = t.form.Form;

const DeviceForm = t.struct({
  deviceId: t.String,
  name: t.String,
});

@inject('deviceStore')
@observer
class DeviceEditForm extends React.Component {
  constructor(props) {
    super(props);
    const editing = this.props.isNew ? true : false;
    this.state = {
      deviceItem: clone(this.props.deviceItem),
      editing,
      options: {
        fields: {
          deviceId: {
            editable: editing,
          },
          name: {
            editable: editing,
          },
        },
      },
    };
  }

  onPressSave() {
    this.props.onPressSave(this.state.deviceItem);
    this.onPressEdit();
  }

  onPressEdit() {
    const nextEditing = !this.state.editing;
    const options = t.update(this.state.options, {
      fields: {
        name: {
          editable: { $set: nextEditing },
        },
        deviceId: {
          editable: { $set: nextEditing },
        },
      },
    });
    this.setState({
      editing: nextEditing,
      options,
    });
    if (!nextEditing) {
      this.setState({
        deviceItem: clone(this.props.deviceItem),
      });
    }
  }

  onChange(e) {
    const { deviceItem } = this.state;
    deviceItem.editProperty('name', e.name);
    deviceItem.editProperty('deviceId', e.deviceId);
  }

  render() {
    const { deviceItem } = this.state;
    const { isNew } = this.props;
    return (
      <View style={styles.container}>
        <Text>#{isNew ? 'New' : this.props.index}</Text>
        <Button title="Edit" onPress={this.onPressEdit.bind(this)} />
        <Form
          type={DeviceForm}
          value={deviceItem}
          options={this.state.options}
          onChange={this.onChange.bind(this)}
          ref="form"
        />
        <Button
          title="Save"
          color="red"
          onPress={this.onPressSave.bind(this)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
    backgroundColor: '#ffffff',
  },
});

export default DeviceEditForm;
