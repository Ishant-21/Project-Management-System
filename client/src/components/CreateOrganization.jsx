import { useState } from "react";
import api from "../configs/api";
import { useNavigate } from "react-router-dom";

const CreateOrganization = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/api/workspaces", { name, description });
      if (data?.workspace) {
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create Organization</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={submit}>
        <input
          className="w-full mb-3 p-2 border"
          placeholder="Organization name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full mb-3 p-2 border"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={loading}
          type="submit"
        >
          {loading ? "Creating..." : "Create Organization"}
        </button>
      </form>
    </div>
  );
};

export default CreateOrganization;
