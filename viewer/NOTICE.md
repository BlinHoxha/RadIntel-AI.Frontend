# Pinned viewer artifact notices

The local synthetic proof uses official @ohif/app 3.11.1 at source commit 3c2b027e8bc7a238ffe46ecb5f57c6c913069c3e. Published artifact integrity and SHA-256 are in ohif.lock.json. Artifact bytes and distributed license files are preserved in ignored .tools/ohif/3.11.1; prepare-viewer verifies the pin before extraction. The static proof host serves verified upstream assets plus product-owned configuration/bootstrap/Part 10 adapter code. Upstream bundle source is not patched.

The upstream root is MIT, with copyright (c) 2018 Open Health Imaging Foundation. Retain that LICENSE and all distributed notices if redistributing. Bundled codecs, fonts and transitive packages can have their own terms; the root MIT label is not clearance for the full tree. dependency-inventory.json records declared dependency ranges and observed module names; it is not a resolved SBOM or completed security/license audit. No fresh vulnerability audit or clinical certification is claimed.

The test-only dicom-parser@1.8.21 independently validates generated Part 10 interoperability; it is not shipped as a diagnostic engine in the product UI. The prebuilt artifact keeps its own React/Cornerstone runtime isolated from the product React tree.

The rejected 3.11.0 candidate remains only in ignored local tools as a historical download. 3.11.1 includes the upstream DICOM JSON missing-series guard needed by this proof. Selection is for bounded synthetic compatibility; support/lifecycle and dependency review remain release work.
