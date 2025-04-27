import * as React from "react";
import { ClipboardItem } from "../types";

export function useFilteredClipboard(
  clipboardData: ClipboardItem[],
  searchQuery: string,
  activeTab: 'all' | 'text' | 'link' | 'image'
) {
  // Segregate pinned and unpinned items
  const pinnedItems = React.useMemo(() => 
    clipboardData.filter((item) => item.pinned), 
    [clipboardData]
  );
  
  const unpinnedItems = React.useMemo(() => 
    clipboardData.filter((item) => !item.pinned), 
    [clipboardData]
  );

  // Filter items based on search query and active tab
  const filteredPinnedItems = React.useMemo(() => 
    pinnedItems.filter((item) =>
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTab === 'all' || item.type === activeTab)
    ), 
    [pinnedItems, searchQuery, activeTab]
  );
  
  const filteredUnpinnedItems = React.useMemo(() => 
    unpinnedItems.filter((item) =>
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTab === 'all' || item.type === activeTab)
    ), 
    [unpinnedItems, searchQuery, activeTab]
  );

  return {
    filteredPinnedItems,
    filteredUnpinnedItems
  };
}