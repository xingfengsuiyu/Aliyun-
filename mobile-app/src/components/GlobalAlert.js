import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

const AlertRoot = forwardRef(function AlertRoot(props, ref) {
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', buttons: [] });

  useImperativeHandle(ref, () => ({
    show(options) {
      setAlert({
        visible: true,
        title: options.title || '',
        message: options.message || '',
        buttons: options.buttons || [{ text: '确定' }],
      });
    },
    alert(title, message, buttons) {
      this.show({ title, message, buttons });
    },
  }));

  const handleButton = (button) => {
    setAlert(prev => ({ ...prev, visible: false }));
    if (button.onPress) {
      setTimeout(() => button.onPress(), 100);
    }
  };

  return (
    <Modal visible={alert.visible} transparent animationType="fade" onRequestClose={() => handleButton({})}>
      <Pressable style={styles.overlay} onPress={() => handleButton({})}>
        <View style={styles.box} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{alert.title}</Text>
          {alert.message ? <Text style={styles.message}>{alert.message}</Text> : null}
          <View style={styles.buttons}>
            {alert.buttons.map((button, i) => (
              <Pressable
                key={i}
                style={[styles.button, i > 0 && styles.buttonBorder]}
                onPress={() => handleButton(button)}
              >
                <Text style={[styles.buttonText, button.style === 'cancel' && styles.cancelText]}>
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
});

export const alertRef = React.createRef();
export const CustomAlert = {
  alert(title, message, buttons) {
    if (alertRef.current) {
      alertRef.current.alert(title, message, buttons);
    }
  }
};

global.alert = CustomAlert.alert;

export default AlertRoot;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#fff', borderRadius: 8, padding: 20, minWidth: 280, maxWidth: '85%' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  message: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
  buttons: { flexDirection: 'row', justifyContent: 'center' },
  button: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  buttonBorder: { borderLeftWidth: 1, borderLeftColor: '#eee' },
  buttonText: { fontSize: 16, color: '#409EFF' },
  cancelText: { color: '#999' },
});
