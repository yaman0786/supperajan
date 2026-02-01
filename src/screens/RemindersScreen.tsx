import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  FAB,
  Card,
  Button,
  Dialog,
  Portal,
  TextInput,
  Checkbox,
  useTheme,
} from 'react-native-paper';
import { Reminder } from '../types';
import StorageService from '../services/StorageService';
import { format } from 'date-fns';

/**
 * RemindersScreen - Manage reminders with emotional context
 */
const RemindersScreen: React.FC = () => {
  const theme = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const data = await StorageService.loadReminders();
    setReminders(data);
  };

  const handleAddReminder = async () => {
    if (!newTitle.trim()) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      dueDate: new Date(),
      isCompleted: false,
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    await StorageService.saveReminders(updated);

    setNewTitle('');
    setNewDescription('');
    setDialogVisible(false);
  };

  const handleToggleComplete = async (id: string) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
    );
    setReminders(updated);
    await StorageService.saveReminders(updated);
  };

  const handleDeleteReminder = async (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    await StorageService.saveReminders(updated);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Hatırlatmalarım
        </Text>

        {reminders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Henüz hatırlatma yok. Yeni hatırlatma eklemek için + butonuna basın.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          reminders.map(reminder => (
            <Card
              key={reminder.id}
              style={[
                styles.reminderCard,
                reminder.isCompleted && styles.completedCard,
              ]}
            >
              <Card.Content>
                <View style={styles.reminderHeader}>
                  <Checkbox
                    status={reminder.isCompleted ? 'checked' : 'unchecked'}
                    onPress={() => handleToggleComplete(reminder.id)}
                  />
                  <View style={styles.reminderContent}>
                    <Text
                      variant="titleMedium"
                      style={[
                        styles.reminderTitle,
                        reminder.isCompleted && styles.completedText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {reminder.title}
                    </Text>
                    {reminder.description && (
                      <Text
                        variant="bodyMedium"
                        style={[
                          styles.reminderDescription,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {reminder.description}
                      </Text>
                    )}
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      {format(new Date(reminder.dueDate), 'dd MMM yyyy')}
                    </Text>
                  </View>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleDeleteReminder(reminder.id)}>
                  Sil
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Yeni Hatırlatma</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Başlık"
              value={newTitle}
              onChangeText={setNewTitle}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Açıklama (İsteğe bağlı)"
              value={newDescription}
              onChangeText={setNewDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>İptal</Button>
            <Button onPress={handleAddReminder}>Ekle</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  emptyCard: {
    marginVertical: 8,
  },
  reminderCard: {
    marginVertical: 8,
  },
  completedCard: {
    opacity: 0.6,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reminderContent: {
    flex: 1,
    marginLeft: 8,
  },
  reminderTitle: {
    fontWeight: 'bold',
  },
  reminderDescription: {
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  dialogInput: {
    marginBottom: 8,
  },
});

export default RemindersScreen;
