import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { linkJurimetria, tribunalDoHost } from "../src/config.ts";

describe("tribunal da página", () => {
    it("reconhece STJ e STF pelo host", () => {
        assert.equal(tribunalDoHost("processo.stj.jus.br", null), "STJ");
        assert.equal(tribunalDoHost("scon.stj.jus.br", null), "STJ");
        assert.equal(tribunalDoHost("portal.stf.jus.br", null), "STF");
    });

    it("na página local usa o tribunal marcado e cai em STJ", () => {
        assert.equal(tribunalDoHost("127.0.0.1", "STF"), "STF");
        assert.equal(tribunalDoHost("127.0.0.1", null), "STJ");
    });
});

describe("link do Jurimetria", () => {
    it("junta o BASE com o caminho relativo da decisão", () => {
        assert.equal(
            linkJurimetria("http://127.0.0.1:8787", "/decisao/abc"),
            "http://127.0.0.1:8787/decisao/abc",
        );
        assert.equal(
            linkJurimetria("http://127.0.0.1:8787/", "/decisao/abc"),
            "http://127.0.0.1:8787/decisao/abc",
        );
    });
});
