import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, FileText, CheckCircle, X, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const Upload = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState([]);

    const fetchDocuments = async () => {
        try {
            const { data } = await api.get('/documents');
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleDeleteDocument = async (id) => {
        if (!confirm('Are you sure you want to delete this document? This will also remove it from your AI knowledge base.')) return;

        const toastId = toast.loading('Removing document...');
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            toast.success('Document deleted', { id: toastId });
        } catch (error) {
            toast.error('Failed to delete document', { id: toastId });
        }
    };

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, []);

    const handleFiles = (newFiles) => {
        const MAX_SIZE = 200 * 1024 * 1024; // 200MB
        const validFiles = newFiles.filter(file => {
            const isTypeValid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
                .includes(file.type) || file.name.endsWith('.docx') || file.name.endsWith('.pdf') || file.name.endsWith('.txt');
            const isSizeValid = file.size <= MAX_SIZE;

            if (!isSizeValid) toast.error(`${file.name} is too large (max 200MB)`);
            return isTypeValid && isSizeValid;
        });

        if (validFiles.length === 0 && newFiles.length > 0) {
            toast.error('No valid files selected (PDF, DOCX, TXT only)');
        }

        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        if (files.length === 0) return;

        setUploading(true);
        const toastId = toast.loading('Processing documents and generating embeddings...');

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                await api.post('/upload', formData);
            }
            toast.success('All documents uploaded and indexed!', { id: toastId });
            setFiles([]);
            fetchDocuments();
        } catch (error) {
            toast.error('Failed to upload some documents', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-4xl font-bold mb-2">Upload Knowledge</h1>
                <p className="text-secondary text-lg">Add research papers, notes, or articles to your AI library.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <motion.div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`
              glass-card p-12 border-2 border-dashed transition-all text-center
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-white/10 hover:border-white/20'}
            `}
                    >
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <UploadIcon size={40} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Drag & drop files here</h3>
                        <p className="text-secondary mb-8">Support for PDF, DOCX, and TXT (Max 200MB per file)</p>

                        <input
                            type="file"
                            multiple
                            accept=".pdf,.docx,.txt"
                            className="hidden"
                            id="fileInput"
                            onChange={(e) => handleFiles(Array.from(e.target.files))}
                        />
                        <label htmlFor="fileInput" className="btn-primary w-fit mx-auto cursor-pointer">
                            Browse Files
                        </label>
                    </motion.div>

                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold flex items-center gap-2">
                                    Selected Files <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{files.length}</span>
                                </h4>
                                <button
                                    onClick={() => setFiles([])}
                                    className="text-secondary hover:text-white transition-colors text-sm font-medium"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText size={18} className="text-primary flex-shrink-0" />
                                            <span className="text-sm truncate font-medium">{file.name}</span>
                                            <span className="text-[10px] text-secondary">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <button onClick={() => removeFile(i)} className="text-secondary hover:text-red-500">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={uploading}
                                onClick={uploadFiles}
                                className="btn-primary w-full py-3 mt-8"
                            >
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : 'Process & Upload Knowledge'}
                            </button>
                        </motion.div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 h-full flex flex-col">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-500" /> Your Library
                        </h3>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[600px]">
                            {documents.length === 0 ? (
                                <div className="text-center py-20">
                                    <AlertCircle size={40} className="text-secondary/50 mx-auto mb-4" />
                                    <p className="text-secondary text-sm">No documents uploaded yet.</p>
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all group">
                                        <div className="flex items-start gap-3 overflow-hidden">
                                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                                <FileText size={20} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium truncate">{doc.file_name}</p>
                                                <p className="text-[10px] text-secondary mt-1">
                                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            className="p-2 text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete Document"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upload;
