const getDefaultSubject = (dataroomName) => {
  return `New files uploaded in ${dataroomName}`;
};

const getDefaultNote = (dataroomId, dataroomName, files) => {
  return `<p>The purpose of this message is to notify you of new or updated document(s) on ${dataroomName}.</br></br>${files
    ?.map(
      (file) =>
        `<a href="${process.env.FRONTEND_URI}/dataroom/${dataroomId}/files?filePath=${file._id}" rel="noopener noreferrer" target="_blank">${file.name}</a></br>`
    )
    .join("")}
<br/>Should you require any general or technical assistance please contact Zk-group 24/7 support Team.</p>`;
};

export { getDefaultSubject, getDefaultNote };
