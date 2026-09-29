/* =========================================================
   AFFINIX - MAIN JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const textTab = document.getElementById("textTab");
    const fileTab = document.getElementById("fileTab");

    const textInputArea = document.getElementById("textInputArea");
    const fileInputArea = document.getElementById("fileInputArea");

    const textInput = document.getElementById("text");
    const fileInput = document.getElementById("file");

    const encryptBtn = document.getElementById("encryptBtn");
    const decryptBtn = document.getElementById("decryptBtn");

    const runBtn = document.getElementById("runBtn");

    const aInput = document.getElementById("a");
    const bInput = document.getElementById("b");

    const err = document.getElementById("err");

    const resultFull = document.getElementById("r_full");
    const resultNoSpace = document.getElementById("r_nospace");
    const resultGroups = document.getElementById("r_groups");

    const textOutputs = document.getElementById("textOutputs");

    /* Optional elements:
       Tidak error kalau HTML belum punya elemen ini.
    */

    const keyStatus = document.getElementById("keyStatus");

    let currentInputMode = "text";
    let currentOperation = "encrypt";


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    setInputMode("text");
    setOperation("encrypt");
    validateKeys();


    /* =====================================================
       TAB: PLAIN TEXT / FILE
       ===================================================== */

    if (textTab) {
        textTab.addEventListener("click", () => {
            setInputMode("text");
        });
    }

    if (fileTab) {
        fileTab.addEventListener("click", () => {
            setInputMode("file");
        });
    }


    function setInputMode(mode) {

        currentInputMode = mode;

        clearError();
        clearResults();

        if (mode === "text") {

            textTab?.classList.add("active");
            fileTab?.classList.remove("active");

            textInputArea?.classList.remove("hidden");
            fileInputArea?.classList.add("hidden");

            textInputArea?.classList.add("fade-in");

            if (textOutputs) {
                textOutputs.classList.remove("hidden");
            }

        } else {

            textTab?.classList.remove("active");
            fileTab?.classList.add("active");

            textInputArea?.classList.add("hidden");
            fileInputArea?.classList.remove("hidden");

            fileInputArea?.classList.add("fade-in");

            if (textOutputs) {
                textOutputs.classList.add("hidden");
            }
        }
    }


    /* =====================================================
       OPERATION: ENCRYPT / DECRYPT
       ===================================================== */

    encryptBtn?.addEventListener("click", () => {
        setOperation("encrypt");
    });

    decryptBtn?.addEventListener("click", () => {
        setOperation("decrypt");
    });


    function setOperation(mode) {

        currentOperation = mode;

        clearError();
        clearResults();

        if (mode === "encrypt") {

            encryptBtn?.classList.add("active");
            decryptBtn?.classList.remove("active");

        } else {

            encryptBtn?.classList.remove("active");
            decryptBtn?.classList.add("active");

        }
    }


    /* =====================================================
       KEY VALIDATION
       ===================================================== */

    aInput?.addEventListener("change", validateKeys);
    aInput?.addEventListener("input", validateKeys);

    bInput?.addEventListener("input", validateKeys);

    function validateKeys() {

        const a = Number(aInput?.value);
        const b = Number(bInput?.value);

        let valid = true;
        let message = "";

        const validA = [
            1, 3, 5, 7, 9, 11,
            15, 17, 19, 21, 23, 25
        ];

        if (!Number.isInteger(a) || !validA.includes(a)) {
            valid = false;
            message = "❌ Key A harus koprima dengan 26.";
        }

        else if (
            !Number.isInteger(b) ||
            b < 0 ||
            b > 25
        ) {
            valid = false;
            message = "❌ Key B harus berada di antara 0–25.";
        }

        if (keyStatus) {

            keyStatus.textContent = valid
                ? "✓ VALID KEY"
                : message;

            keyStatus.classList.toggle("valid", valid);
            keyStatus.classList.toggle("invalid", !valid);
        }

        if (!valid) {
            showError(message);
        } else {
            clearError();
        }

        return valid;
    }


    /* =====================================================
       RUN BUTTON
       ===================================================== */

    runBtn?.addEventListener("click", async () => {

        clearError();

        if (!validateKeys()) {
            return;
        }

        setLoading(true);

        try {

            if (currentInputMode === "text") {

                await processText();

            } else {

                await processFile();

            }

        } catch (error) {

            console.error(error);

            showError(
                error.message ||
                "Terjadi kesalahan saat memproses data."
            );

        } finally {

            setLoading(false);

        }
    });


    /* =====================================================
       PROCESS TEXT
       ===================================================== */

    async function processText() {

        const text = textInput?.value ?? "";

        if (!text.trim()) {

            showError(
                currentOperation === "encrypt"
                    ? "Masukkan plaintext terlebih dahulu."
                    : "Masukkan ciphertext terlebih dahulu."
            );

            return;
        }


        const formData = new FormData();

        formData.append("a", aInput.value);
        formData.append("b", bInput.value);
        formData.append("mode", currentOperation);
        formData.append("text", text);


        const response = await fetch(
            "/api/text",
            {
                method: "POST",
                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok || !data.ok) {

            throw new Error(
                data.error ||
                "Gagal memproses teks."
            );
        }


        resultFull.value = data.result ?? "";
        resultNoSpace.value = data.no_space ?? "";
        resultGroups.value = data.groups ?? "";


        textOutputs?.classList.remove("hidden");


        /* Scroll sedikit ke result */

        resultFull.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    /* =====================================================
       PROCESS FILE
       ===================================================== */

    async function processFile() {

        const file = fileInput?.files?.[0];


        if (!file) {

            showError(
                "Pilih file terlebih dahulu."
            );

            return;
        }


        const formData = new FormData();

        formData.append("a", aInput.value);
        formData.append("b", bInput.value);
        formData.append("mode", currentOperation);
        formData.append("file", file);


        const response = await fetch(
            "/api/file",
            {
                method: "POST",
                body: formData
            }
        );


        if (!response.ok) {

            let message =
                "Gagal memproses file.";

            try {

                const data =
                    await response.json();

                message =
                    data.error || message;

            } catch (_) {
                /* response bukan JSON */
            }

            throw new Error(message);
        }


        const blob = await response.blob();


        const filename =
            getFilenameFromResponse(response)
            ||
            (
                currentOperation === "encrypt"
                    ? "encrypted_output.dat"
                    : "hasil_dekripsi"
            );


        showFileResult(
            filename,
            blob
        );
    }


    /* =====================================================
       GET DOWNLOAD FILENAME
       ===================================================== */

    function getFilenameFromResponse(response) {

        const contentDisposition =
            response.headers.get(
                "Content-Disposition"
            );

        if (!contentDisposition) {
            return null;
        }


        /*
         * Handle:
         *
         * filename="test.dat"
         *
         * filename*=UTF-8''test.dat
         */

        const utf8Match =
            contentDisposition.match(
                /filename\*=UTF-8''([^;]+)/i
            );

        if (utf8Match) {

            return decodeURIComponent(
                utf8Match[1]
            );
        }


        const normalMatch =
            contentDisposition.match(
                /filename="?([^"]+)"?/i
            );

        if (normalMatch) {

            return normalMatch[1];
        }


        return null;
    }


    /* =====================================================
       FILE RESULT
       ===================================================== */

    function showFileResult(filename, blob) {

        clearResults();


        const cipherSection =
            document.getElementById("cipher");


        if (!cipherSection) {
            return;
        }


        const oldCard =
            document.getElementById(
                "fileResultCard"
            );

        oldCard?.remove();


        const card =
            document.createElement("div");

        card.id = "fileResultCard";

        card.className =
            "file-result-card fade-in";


        /* File info */

        const info =
            document.createElement("div");

        info.className =
            "result-file-info";


        const icon =
            document.createElement("div");

        icon.className =
            "result-file-icon";

        icon.textContent = "▣";


        const textWrapper =
            document.createElement("div");


        const name =
            document.createElement("div");

        name.className =
            "result-file-name";

        name.textContent = filename;


        const size =
            document.createElement("div");

        size.className =
            "result-file-size";

        size.textContent =
            formatFileSize(blob.size);


        textWrapper.appendChild(name);
        textWrapper.appendChild(size);

        info.appendChild(icon);
        info.appendChild(textWrapper);


        /* Download */

        const download =
            document.createElement("button");

        download.type = "button";

        download.className =
            "download-button";

        download.textContent =
            "↓ Download";


        download.addEventListener(
            "click",
            () => {

                downloadBlob(
                    blob,
                    filename
                );

            }
        );


        card.appendChild(info);
        card.appendChild(download);


        /*
         * Cari label RESULT.
         * Kalau HTML mempunyai .result-container,
         * masukkan ke sana.
         */

        const resultContainer =
            document.getElementById(
                "fileResultContainer"
            );


        if (resultContainer) {

            resultContainer.innerHTML = "";

            resultContainer.appendChild(card);

        } else {

            /*
             * Fallback:
             * masukkan setelah run area
             */

            const runArea =
                document.querySelector(
                    ".run-area"
                );

            if (runArea) {

                runArea.insertAdjacentElement(
                    "afterend",
                    card
                );

            } else {

                cipherSection.appendChild(card);

            }
        }


        card.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    /* =====================================================
       DOWNLOAD BLOB
       ===================================================== */

    function downloadBlob(blob, filename) {

        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();


        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }


    /* =====================================================
       FILE INPUT
       ===================================================== */

    fileInput?.addEventListener(
        "change",
        () => {

            const file =
                fileInput.files?.[0];

            if (!file) {
                return;
            }

            clearError();

            showSelectedFile(file);
        }
    );


    function showSelectedFile(file) {

        const nameElement =
            document.getElementById(
                "selectedFileName"
            );

        const sizeElement =
            document.getElementById(
                "selectedFileSize"
            );

        if (nameElement) {
            nameElement.textContent =
                file.name;
        }

        if (sizeElement) {
            sizeElement.textContent =
                formatFileSize(file.size);
        }

        /*
         * Kalau file info belum ada,
         * buat otomatis di bawah dropzone.
         */

        const dropzone =
            document.getElementById(
                "fileDropzone"
            );

        if (
            dropzone &&
            !nameElement &&
            !sizeElement
        ) {

            let selected =
                dropzone.querySelector(
                    ".selected-file"
                );

            if (!selected) {

                selected =
                    document.createElement("div");

                selected.className =
                    "selected-file";

                dropzone.appendChild(
                    selected
                );
            }


            selected.innerHTML = `
                <div class="selected-file-name">
                    ${escapeHtml(file.name)}
                </div>

                <div class="selected-file-size">
                    ${formatFileSize(file.size)}
                </div>
            `;
        }
    }


    /* =====================================================
       DRAG & DROP
       ===================================================== */

    const dropzone =
        document.getElementById(
            "fileDropzone"
        );


    if (dropzone) {

        [
            "dragenter",
            "dragover"
        ].forEach(eventName => {

            dropzone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    dropzone.classList.add(
                        "dragover"
                    );
                }
            );

        });


        [
            "dragleave",
            "drop"
        ].forEach(eventName => {

            dropzone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    dropzone.classList.remove(
                        "dragover"
                    );
                }
            );

        });


        dropzone.addEventListener(
            "drop",
            event => {

                const files =
                    event.dataTransfer.files;

                if (!files || !files.length) {
                    return;
                }


                /*
                 * FileList tidak selalu bisa
                 * langsung diassign.
                 *
                 * DataTransfer digunakan supaya
                 * input.files ikut terisi.
                 */

                try {

                    const dt =
                        new DataTransfer();

                    dt.items.add(files[0]);

                    fileInput.files =
                        dt.files;

                } catch (error) {

                    console.warn(
                        "DataTransfer unsupported:",
                        error
                    );

                }


                showSelectedFile(
                    files[0]
                );

                clearError();
            }
        );
    }


    /* =====================================================
       COPY BUTTON SUPPORT
       ===================================================== */

    document.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-copy-target]"
                );

            if (!button) {
                return;
            }


            const targetId =
                button.dataset.copyTarget;


            const target =
                document.getElementById(
                    targetId
                );


            if (!target) {
                return;
            }


            try {

                await navigator.clipboard.writeText(
                    target.value
                );


                const original =
                    button.textContent;


                button.textContent =
                    "COPIED ✓";


                setTimeout(() => {

                    button.textContent =
                        original;

                }, 1200);

            } catch (error) {

                showError(
                    "Tidak bisa menyalin hasil."
                );
            }
        }
    );


    /* =====================================================
       CLEAR RESULT
       ===================================================== */

    function clearResults() {

        if (resultFull) {
            resultFull.value = "";
        }

        if (resultNoSpace) {
            resultNoSpace.value = "";
        }

        if (resultGroups) {
            resultGroups.value = "";
        }


        const fileResult =
            document.getElementById(
                "fileResultCard"
            );

        fileResult?.remove();
    }


    /* =====================================================
       ERROR
       ===================================================== */

    function showError(message) {

        if (err) {
            err.textContent = message;
        }
    }


    function clearError() {

        if (err) {
            err.textContent = "";
        }
    }


    /* =====================================================
       LOADING
       ===================================================== */

    function setLoading(isLoading) {

        if (!runBtn) {
            return;
        }


        runBtn.disabled = isLoading;


        if (isLoading) {

            runBtn.dataset.originalText =
                runBtn.textContent;

            runBtn.textContent =
                "PROCESSING...";

        } else {

            runBtn.textContent =
                runBtn.dataset.originalText
                || "RUN >>";
        }
    }


    /* =====================================================
       HELPERS
       ===================================================== */

    function formatFileSize(bytes) {

        if (bytes === 0) {
            return "0 Bytes";
        }


        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];

        const index =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            );


        return (
            parseFloat(
                (
                    bytes /
                    Math.pow(1024, index)
                ).toFixed(2)
            )
            +
            " "
            +
            units[index]
        );
    }


    function escapeHtml(value) {

        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

});