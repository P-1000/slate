import * as React from "react";
import { Search, ChevronLeft, Pin, Copy, Trash2, File, ArrowUpRight, PiIcon } from "lucide-react";

declare global {
  interface Window {
    ipcRenderer: IpcRendererExtended;
  }
}

interface IpcRendererExtended extends Electron.IpcRenderer {
  getClipboardData(): Promise<ClipboardItem[]>;
  deleteClipboardData(id: string): Promise<boolean>;
  pinClipboardData(id: string): Promise<ClipboardItem>;
  copyToClipboard(content: string): void;
}

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: Date;
  application: string;
  type: "text" | "image" | "link";
  characters: number;
  words: number;
  pinned?: boolean;
  metadata?: any; // For link metadata like title and description
}

export default function ClipboardManager() {
  const [clipboardData, setClipboardData] = React.useState<ClipboardItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<ClipboardItem | null>(null);
  const [activeTab, setActiveTab] = React.useState<'all' | 'text' | 'link' | 'image'>('all');

  // Fetch clipboard data using the provided function
  React.useEffect(() => {
    const fetchClipboardData = async () => {
      try {
        const data: ClipboardItem[] = await window.ipcRenderer.getClipboardData();
        const processedData = data.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        const sortedData = processedData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setClipboardData(sortedData);
      } catch (error) {
        console.error("Error fetching clipboard data:", error);
      }
    };

    fetchClipboardData();
  }, []);

  // Segregate pinned and unpinned items
  const pinnedItems = clipboardData.filter((item) => item.pinned);
  const unpinnedItems = clipboardData.filter((item) => !item.pinned);

  // Filter items based on search query and active tab
  const filteredPinnedItems = pinnedItems.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeTab === 'all' || item.type === activeTab)
  );
  const filteredUnpinnedItems = unpinnedItems.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeTab === 'all' || item.type === activeTab)
  );


  // when active tab changes then fetch them and set them 
  React.useEffect

  const deleteItem = async (id: string) => {
    try {
      const success = await window.ipcRenderer.deleteClipboardData(id);
      if (success) {
        setClipboardData((prevData) => prevData.filter((item) => item.id !== id));
      } else {
        console.error(`Failed to delete clipboard item with ID: ${id}`);
      }
    } catch (error) {
      console.error("Error deleting clipboard item:", error);
    }
  };

  const pinItem = async (id: string) => {
    try {
      const updatedItem = await window.ipcRenderer.pinClipboardData(id);
      if (updatedItem) {
        setClipboardData((prevData) =>
          prevData.map((item) => (item.id === id ? updatedItem : item))
        );
      } else {
        console.error(`Failed to pin clipboard item with ID: ${id}`);
      }
    } catch (error) {
      console.error("Error pinning clipboard item:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-clip">
      {/* Left Sidebar */}
      <div className="max-w-52 border-r border-gray-800">
        <div className="flex items-center p-2 border-b border-gray-800">
          <button className="mr-2 p-2 hover:bg-gray-800 rounded">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
            <input
              type="text"
              placeholder="Type to filter entries..."
              className="w-full bg-gray-900 text-teal-100/50 pl-8 pr-4 py-1 rounded-md text-sm focus:outline-none focus:ring focus:ring-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs for Categorizing Items */}
        <div className="flex border-b border-gray-800">
          {['All', 'Text', 'Links', 'Images'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type.toLowerCase() as 'all' | 'text' | 'link' | 'image')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === type.toLowerCase() ? 'bg-gray-800 text-teal-100' : 'text-gray-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto h-[calc(100vh-56px)]">
          {/* Pinned Items Section */}
          {filteredPinnedItems.length > 0 && (
            <section>
              <h3 className="p-2 px-3 text-white/70 text-sm">Pinned</h3>
              {filteredPinnedItems.map((item) => (
                <ClipboardEntry
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </section>
          )}

          {/* Unpinned Items Section */}
          {filteredUnpinnedItems.length > 0 ? (
            <section>
              <h3 className="p-2 px-3 text-white/70 text-sm">Clipboard Items</h3>
              {filteredUnpinnedItems.map((item) => (
                <ClipboardEntry
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </section>
          ) : (
            !filteredPinnedItems.length && (
              <div className="p-4 text-gray-500">No items found.</div>
            )
          )}
        </div>
      </div>

      {/* Content Panel */}
      {selectedItem ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Information</h2>
            <div className="space-y-4">
              <DetailRow label="Application" value={selectedItem.application} />
              <DetailRow label="Content type" value={selectedItem.type} />
              <DetailRow label="Characters" value={selectedItem.characters} />
              <DetailRow label="Words" value={selectedItem.content.length} />
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {selectedItem.type === "image" ? (
              <div className="rounded-lg overflow-hidden border border-gray-800">
                <img src={selectedItem.content} alt="Clipboard" className="w-full h-auto" />
              </div>
            ) : selectedItem.type === "link" ? (
              <div className="space-y-2">
                <h3 className="text-sm mb-10 text-white font-semibold">{selectedItem.content}</h3>
              </div>
            ) : (
              <pre className="font-mono text-xs text-white p-4 rounded-lg whitespace-pre-wrap">
                {selectedItem.content}
              </pre>
            )}
          </div>
          <div className="p-4 border-t border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => pinItem(selectedItem.id)}
                className="p-2 hover:bg-gray-800 rounded"
              >
                <Pin className="h-4 text-white/70 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded">
                <Copy 
                  onClick={() => window.ipcRenderer.copyToClipboard(selectedItem.content)}
                  className="h-4 w-4 text-white/70"
                />
              </button>
              {selectedItem.type === "link" && selectedItem.metadata && (
                <button className="p-2 hover:bg-gray-800 rounded">
                  <ArrowUpRight className="h-4 text-white/70 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => deleteItem(selectedItem.id)}
              className="p-2 hover:bg-red-600 rounded text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow text-gray-500">
          Select an item to view details
        </div>
      )}
    </div>
  );
}

const ClipboardEntry = ({ item, isSelected, onClick }: { item: ClipboardItem; isSelected: boolean; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className={`p-2 mx-2 rounded-md cursor-pointer ${isSelected ? "bg-gray-800 text-teal-100" : "hover:bg-gray-800/90 duration-300"} flex items-center space-x-2`}
    >
      {item.pinned ? (
      <Pin className="h-4 w-4 text-blue-500" />
      ) : (
      <File className={`h-4 w-4 ${item.type === "text" ? "text-teal-500" : "text-gray-500"}`} />
      )}
      <div className="flex-1">
      <div className="text-sm text-white">{item.content.replace(/\s+/g, ' ').substring(0, 19)}{item.content.length > 50 && "..."}</div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between ">
    <span className="font-light text-sm text-white/60">{label}</span>
    <span className="text-white/70 text-sm ">{value}</span>
  </div>
);
