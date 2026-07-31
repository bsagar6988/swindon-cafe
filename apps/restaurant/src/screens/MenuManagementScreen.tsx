import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AppHeader, formatGBP, theme, type MenuCategory, type MenuItem } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

export function MenuManagementScreen() {
  const { api } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySortOrder, setNewCategorySortOrder] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const menu = await api.getMyMenu();
      setCategories(menu.categories.slice().sort((a, b) => a.sortOrder - b.sortOrder));
      setItems(menu.items);
      if (!categoryId && menu.categories.length > 0) {
        setCategoryId(menu.categories[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onToggleAvailable = async (item: MenuItem) => {
    setTogglingId(item.id);
    const previous = item.isAvailable;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !previous } : i))
    );
    try {
      const updated = await api.updateMenuItem(item.id, { isAvailable: !previous });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (e) {
      // revert on failure
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isAvailable: previous } : i)));
      setError(e instanceof Error ? e.message : "Failed to update item");
    } finally {
      setTogglingId(null);
    }
  };

  const onSubmitNewItem = async () => {
    setFormError(null);
    if (!name.trim()) {
      setFormError("Name is required");
      return;
    }
    const pounds = Number(price);
    if (!price || Number.isNaN(pounds) || pounds < 0) {
      setFormError("Enter a valid price");
      return;
    }
    if (!categoryId) {
      setFormError("Choose a category");
      return;
    }
    setSaving(true);
    try {
      const created = await api.createMenuItem({
        categoryId,
        name: name.trim(),
        description: description.trim() || null,
        priceCents: Math.round(pounds * 100),
        imageUrl: null,
        isAvailable: true,
      });
      setItems((prev) => [...prev, created]);
      setName("");
      setDescription("");
      setPrice("");
      setShowForm(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create item");
    } finally {
      setSaving(false);
    }
  };

  const onSubmitNewCategory = async () => {
    setCategoryError(null);
    if (!newCategoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }
    let sortOrder = categories.length;
    if (newCategorySortOrder.trim()) {
      const parsed = Number(newCategorySortOrder);
      if (Number.isNaN(parsed)) {
        setCategoryError("Enter a valid sort order number");
        return;
      }
      sortOrder = parsed;
    }
    setCategorySaving(true);
    try {
      const created = await api.createCategory(newCategoryName.trim(), sortOrder);
      setCategories((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setNewCategoryName("");
      setNewCategorySortOrder("");
    } catch (e) {
      setCategoryError(e instanceof Error ? e.message : "Failed to create category");
    } finally {
      setCategorySaving(false);
    }
  };

  const startRenameCategory = (cat: MenuCategory) => {
    setCategoryError(null);
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
  };

  const cancelRenameCategory = () => {
    setEditingCategoryId(null);
    setEditCategoryName("");
  };

  const saveRenameCategory = async (cat: MenuCategory) => {
    setCategoryError(null);
    if (!editCategoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }
    setRenamingId(cat.id);
    try {
      const updated = await api.updateCategory(cat.id, { name: editCategoryName.trim() });
      setCategories((prev) =>
        prev
          .map((c) => (c.id === cat.id ? updated : c))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      );
      setEditingCategoryId(null);
      setEditCategoryName("");
    } catch (e) {
      setCategoryError(e instanceof Error ? e.message : "Failed to rename category");
    } finally {
      setRenamingId(null);
    }
  };

  const deleteCategory = async (cat: MenuCategory) => {
    setCategoryError(null);
    setDeletingCategoryId(cat.id);
    try {
      await api.deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      if (categoryId === cat.id) {
        setCategoryId(null);
      }
    } catch (e) {
      setCategoryError(e instanceof Error ? e.message : "Failed to delete category");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const confirmDeleteCategory = (cat: MenuCategory) => {
    const message = `Delete category "${cat.name}"?`;
    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        deleteCategory(cat);
      }
      return;
    }
    Alert.alert("Delete category", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteCategory(cat) },
    ]);
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Menu management" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <AppHeader subtitle="Menu management" />
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Menu management</Text>
          <Text style={styles.subtitle}>Toggle availability or add new items</Text>
        </View>
        <View style={styles.headerButtons}>
          <Button
            title={showCategoryManager ? "Close" : "Manage categories"}
            variant={showCategoryManager ? "outline" : "secondary"}
            onPress={() => setShowCategoryManager((s) => !s)}
            style={styles.headerButton}
          />
          <Button
            title={showForm ? "Close" : "Add item"}
            variant={showForm ? "outline" : "primary"}
            onPress={() => setShowForm((s) => !s)}
            style={styles.headerButton}
          />
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {showCategoryManager && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Categories</Text>
          {categoryError && <Text style={styles.error}>{categoryError}</Text>}

          {categories.length === 0 ? (
            <Text style={styles.emptyText}>No categories yet. Add one below.</Text>
          ) : (
            categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              const isEditing = editingCategoryId === cat.id;
              return (
                <View key={cat.id} style={styles.categoryManageRow}>
                  {isEditing ? (
                    <TextInput
                      style={[styles.input, styles.categoryEditInput]}
                      value={editCategoryName}
                      onChangeText={setEditCategoryName}
                      autoFocus
                    />
                  ) : (
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{cat.name}</Text>
                      <Text style={styles.itemDescription}>
                        {count} item{count === 1 ? "" : "s"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.categoryManageActions}>
                    {isEditing ? (
                      <>
                        <Button
                          title="Save"
                          onPress={() => saveRenameCategory(cat)}
                          loading={renamingId === cat.id}
                          style={styles.smallButton}
                        />
                        <Button
                          title="Cancel"
                          variant="outline"
                          onPress={cancelRenameCategory}
                          style={styles.smallButton}
                        />
                      </>
                    ) : (
                      <>
                        <Button
                          title="Rename"
                          variant="outline"
                          onPress={() => startRenameCategory(cat)}
                          style={styles.smallButton}
                        />
                        <Button
                          title="Delete"
                          variant="danger"
                          loading={deletingCategoryId === cat.id}
                          onPress={() => confirmDeleteCategory(cat)}
                          style={styles.smallButton}
                        />
                      </>
                    )}
                  </View>
                </View>
              );
            })
          )}

          <Text style={[styles.formLabel, { marginTop: theme.spacing(4) }]}>Add category</Text>
          <TextInput
            style={styles.input}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            placeholder="e.g. Desserts"
          />
          <Text style={styles.formLabel}>Sort order</Text>
          <TextInput
            style={styles.input}
            value={newCategorySortOrder}
            onChangeText={setNewCategorySortOrder}
            placeholder={`e.g. ${categories.length}`}
            keyboardType="number-pad"
          />
          <Button
            title="Add category"
            onPress={onSubmitNewCategory}
            loading={categorySaving}
            style={{ marginTop: theme.spacing(3) }}
          />
        </View>
      )}

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Margherita Pizza" />

          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
          />

          <Text style={styles.formLabel}>Price (GBP)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 12.99"
            keyboardType="decimal-pad"
          />

          <Text style={styles.formLabel}>Category</Text>
          <View style={styles.categoryPicker}>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.categoryChip, categoryId === c.id && styles.categoryChipActive]}
                onPress={() => setCategoryId(c.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    categoryId === c.id && styles.categoryChipTextActive,
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {formError && <Text style={styles.error}>{formError}</Text>}

          <Button title="Save item" onPress={onSubmitNewItem} loading={saving} style={{ marginTop: theme.spacing(3) }} />
        </View>
      )}

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.categoryId === cat.id);
        if (catItems.length === 0) return null;
        return (
          <View key={cat.id} style={styles.categorySection}>
            <Text style={styles.sectionHeader}>{cat.name}</Text>
            {catItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>{formatGBP(item.priceCents)}</Text>
                </View>
                <View style={styles.availableCol}>
                  <Text style={styles.availableLabel}>
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </Text>
                  <Switch
                    value={item.isAvailable}
                    onValueChange={() => onToggleAvailable(item)}
                    disabled={togglingId === item.id}
                    trackColor={{ true: theme.colors.secondary, false: theme.colors.border }}
                  />
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
  },
  title: { fontSize: 24, fontWeight: "800", color: theme.colors.text },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  error: { color: theme.colors.danger, marginBottom: theme.spacing(2) },
  emptyText: { color: theme.colors.textMuted, marginBottom: theme.spacing(2) },
  headerButtons: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing(2) },
  headerButton: { paddingVertical: theme.spacing(2), paddingHorizontal: theme.spacing(3) },
  categoryManageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing(2),
  },
  categoryManageActions: { flexDirection: "row", gap: theme.spacing(1.5) },
  categoryEditInput: { flex: 1, marginRight: theme.spacing(2) },
  smallButton: { paddingVertical: theme.spacing(1.5), paddingHorizontal: theme.spacing(2.5) },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textMuted,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(3),
    fontSize: 15,
    backgroundColor: theme.colors.background,
  },
  categoryPicker: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing(2) },
  categoryChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing(1.5),
    paddingHorizontal: theme.spacing(3),
  },
  categoryChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryChipText: { color: theme.colors.text, fontSize: 13, fontWeight: "600" },
  categoryChipTextActive: { color: "#fff" },
  categorySection: { marginBottom: theme.spacing(4) },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing(2),
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemName: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  itemDescription: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: "700", color: theme.colors.primary, marginTop: 4 },
  availableCol: { alignItems: "flex-end", marginLeft: theme.spacing(3) },
  availableLabel: { fontSize: 11, color: theme.colors.textMuted, marginBottom: 4 },
});
