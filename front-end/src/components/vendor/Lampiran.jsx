import React from 'react';

const Lampiran = ({ onFileChange, onKeteranganChange, required = false }) => {
  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Lampiran</h2>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Unggah Dokumen</span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={onFileChange}
            required={required}
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Keterangan</span>
          </label>
          <textarea
            className="textarea textarea-bordered"
            placeholder="Keterangan"
            onChange={onKeteranganChange}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Lampiran;
