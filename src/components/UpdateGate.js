import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { checkForUpdates, applyUpdate } from "../utils/updates";
import { useColors } from "../storage/ThemeContext";
import { RADIUS } from "../utils/theme";

export default function UpdateGate({ children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await checkForUpdates();
      if (mounted && r.available) setShow(true);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      {children}
      <UpdateModal
        visible={show}
        onDismiss={() => setShow(false)}
        onRestart={async () => {
          setShow(false);
          await applyUpdate();
        }}
      />
    </>
  );
}

export function UpdateModal({ visible, onDismiss, onRestart }) {
  const colors = useColors();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 380,
            backgroundColor: colors.surface,
            borderRadius: RADIUS.lg,
            padding: 24,
            borderWidth: 1,
            borderColor: colors.divider,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: "rgba(20,184,166,0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Icon name="download-cloud" size={28} color={colors.teal} />
          </View>

          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "800",
              marginBottom: 6,
            }}
          >
            Update Available
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: 14,
              lineHeight: 20,
              marginBottom: 22,
            }}
          >
            A new version of Word of the Day is ready. Restart now to apply the
            update?
          </Text>

          <Pressable
            testID="update-restart-now-button"
            onPress={onRestart}
            style={({ pressed }) => ({
              backgroundColor: colors.teal,
              opacity: pressed ? 0.85 : 1,
              alignItems: "center",
              paddingVertical: 14,
              borderRadius: RADIUS.md,
              marginBottom: 8,
            })}
          >
            <Text style={{ color: colors.bg, fontWeight: "800", fontSize: 15 }}>
              Restart Now
            </Text>
          </Pressable>

          <Pressable
            testID="update-later-button"
            onPress={onDismiss}
            style={({ pressed }) => ({
              alignItems: "center",
              paddingVertical: 12,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: colors.muted, fontWeight: "600", fontSize: 14 }}>
              Later
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
