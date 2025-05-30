import React, { useEffect, useState } from "react";
import axios from "axios";

function groupPhotosByMonth(photos) {
  const groups = {};
  photos.forEach((photo) => {
    const date = new Date(photo.createdAt);
    const key = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(photo);
  });
  return groups;
}

function MainContainer() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isFav, setIsFav] = useState(false);

  const fetchAlbums = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/photos/get/albums`);
      setAlbums(res.data);
    } catch (err) {
      console.error("Failed to fetch albums:", err);
    }
  };

  const fetchPhotos = async (albumId, page = 1, append = false) => {
    try {
      setLoading(true);
      const params = { pageNumber: page, pageSize: 20 };
      if (albumId) params.albumId = albumId;
      if (searchText) params.searchText = searchText;

      const res = await axios.get(`http://localhost:3000/photos/get/photos`, {
        params,
      });

      const { photos: newPhotos, totalPages: total } = res.data;

      setPhotos((prev) => (append ? [...prev, ...newPhotos] : newPhotos));
      setTotalPages(total);
      setHasMore(page < total);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch photos:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    setPageNumber(1);
    setPhotos([]);
    fetchPhotos(selectedAlbum?._id, 1, false);
  }, [selectedAlbum]);

  const openEditModal = (photo) => {
    setEditingPhoto(photo);
    setPreviewImageUrl(photo.url);
    setPreviewModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY + 100 >=
          document.documentElement.scrollHeight &&
        !loading &&
        hasMore
      ) {
        const nextPage = pageNumber + 1;
        setPageNumber(nextPage);
        fetchPhotos(selectedAlbum?._id, nextPage, true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pageNumber, loading, hasMore, selectedAlbum]);

  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.albumName.value.trim();
    if (!name) return;
    try {
      await axios.post(`http://localhost:3000/photos/create/album`, { name });
      await fetchAlbums();
      setAlbumModalOpen(false);
    } catch (err) {
      console.error("Error creating album:", err);
    }
  };

  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchText(text);
    setPageNumber(1);
    setPhotos([]);
    fetchPhotos(selectedAlbum?._id, 1, false);
  };

  const handleUploadPhotos = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(
        "http://localhost:3000/photos/upload/photos",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setPreviewImageUrl(res.data.url);
      setPreviewModalOpen(true);
    } catch (err) {
      console.error("Photo upload failed:", err);
    }
  };

  const handleSavePhoto = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      url: previewImageUrl,
      title: form.title.value,
      description: form.description.value,
      tags: form.tags.value,
      albumId: selectedAlbum?._id || null,
    };
    try {
      if (editingPhoto) {
        await axios.post(`http://localhost:3000/photos/update`, {
          photoId: editingPhoto._id,
          ...payload,
          fav: isFav,
        });
      } else {
        await axios.post("http://localhost:3000/photos/save/photo", payload);
      }
      setPreviewModalOpen(false);
      setEditingPhoto(null);
      fetchPhotos(selectedAlbum?._id, 1, false);
    } catch (err) {
      console.error("Failed to save photo:", err);
    }
  };

  const photoGroups = groupPhotosByMonth(photos);

  return (
    <>
      {albumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-24">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Album</h2>
            <form onSubmit={handleAlbumSubmit}>
              <input
                type="text"
                name="albumName"
                placeholder="Album name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAlbumModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-20">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingPhoto ? "Edit Photo Details" : "Add Photo Details"}
            </h2>
            <img
              src={previewImageUrl}
              alt="logo"
              className="w-full h-48 object-cover rounded mb-4"
            />
            <form onSubmit={handleSavePhoto}>
              <input
                name="title"
                type="text"
                placeholder="Title"
                defaultValue={editingPhoto?.title || ""}
                className="w-full border px-3 py-2 mb-3 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                defaultValue={editingPhoto?.description || ""}
                className="w-full border px-3 py-2 mb-3 rounded"
              />
              <input
                name="tags"
                type="text"
                placeholder="Tag"
                defaultValue={editingPhoto?.tag || ""}
                className="w-full border px-3 py-2 mb-4 rounded"
              />
              {editingPhoto && (
                <label className="flex items-center space-x-2">
                  <input
                    name="fav"
                    type="checkbox"
                    className="form-checkbox h-3"
                    checked={isFav}
                    onChange={(e) => setIsFav(e.target.checked)}
                  />
                  <span>Favorite</span>
                </label>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editingPhoto ? "Update" : "Save Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-row min-h-screen bg-gray-100">
        <div className="min-w-[250px] bg-white shadow-md p-4 flex flex-col">
          <button
            className={`px-2 py-2 mt-1 text-left rounded-md transition-colors shadow-md ${
              selectedAlbum === null ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setSelectedAlbum(null)}
          >
            All Photos
          </button>
          <h2 className="mt-5 text-xl font-bold mb-4">Albums</h2>
          <button
            onClick={() => setAlbumModalOpen(true)}
            className="px-2 mb-5 py-2 mt-2 bg-blue-200 rounded-md hover:bg-blue-300 transition-colors shadow-md"
          >
            + Create Album
          </button>
          {albums.map((album) => (
            <button
              key={album._id}
              className={`px-2 py-2 mt-1 text-left rounded-md transition-colors shadow-md ${
                selectedAlbum?._id === album._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setSelectedAlbum(album)}
            >
              {album.name}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {selectedAlbum?.name || "All Photos"}
            </h1>
            <div>
              <input
                type="text"
                placeholder="Search photos"
                value={searchText}
                onChange={handleSearch}
                className="px-3 py-1.5 mx-5 border w-100 rounded-md shadow"
              />
              <label className="cursor-pointer bg-blue-300 px-4 py-2 rounded hover:bg-blue-400 transition-colors">
                Upload Photo
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleUploadPhotos}
                />
              </label>
            </div>
          </div>

          {selectedMonth ? (
            <>
              <button
                onClick={() => setSelectedMonth(null)}
                className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                ← Back to Collections
              </button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photoGroups[selectedMonth]?.map((photo) => (
                  <div
                    key={photo._id}
                    className="bg-white p-[1px] shadow rounded overflow-hidden hover:cursor-pointer hover:shadow-inner"
                    onClick={() => openEditModal(photo)}
                  >
                    <img
                      src={photo.url}
                      alt="Uploaded"
                      className="w-full h-[150px] object-cover"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(photoGroups).map(([monthKey, monthPhotos]) => {
                const top4 = monthPhotos.slice(0, 4);
                return (
                  <div
                    key={monthKey}
                    className="bg-white rounded shadow p-3 cursor-pointer"
                    onClick={() => setSelectedMonth(monthKey)}
                  >
                    <div className="grid grid-cols-2 grid-rows-2 gap-[2px] mb-2">
                      {top4.map((photo) => (
                        <img
                          key={photo._id}
                          src={photo.url}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                      {top4.length < 4 &&
                        Array.from({ length: 4 - top4.length }).map(
                          (_, idx) => (
                            <div
                              key={idx}
                              className="w-full h-24 bg-gray-200 rounded"
                            />
                          )
                        )}
                    </div>
                    <div className="text-center text-lg font-semibold">
                      {monthKey}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="text-center py-6 text-gray-500">
              Loading more photos...
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MainContainer;
