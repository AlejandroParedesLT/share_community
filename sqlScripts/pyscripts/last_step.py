import pandas as pd

preferences = pd.read_csv("/home/nd191/share_community/unified_preferences.csv")
items = pd.read_csv("/home/nd191/share_community/socialmedia_item_export.csv")
print(len(preferences))
# print(preferences.head())
# print(items.head())

df = preferences.merge(items, left_on="item_id", right_on="original_id", how="left")
df = df.dropna(subset=["original_id"])

print(df.head())
print(len(df))

table = df[["precordsid", "user_id", "item_id", "type_id"]]

table.to_csv("final_preferences_table.csv", index=False)
